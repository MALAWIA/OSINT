"""
Portfolio router for portfolio management and tracking.

This module provides endpoints for portfolio management,
performance tracking, and portfolio analytics.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc

from app.core.database import get_db
from app.deps import get_cache, get_current_user
from app.models.portfolio import Portfolio
from app.models.stock import Stock
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioResponse, PortfolioCreate, PortfolioUpdate,
    PortfolioSummary, PortfolioAnalytics
)

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])


@router.get("/", response_model=List[PortfolioResponse])
async def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> List[PortfolioResponse]:
    """Get user's portfolio."""
    
    cache_key = f"portfolio:{current_user.id}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return [PortfolioResponse.parse_raw(item) for item in cached_result]
    
    portfolio_items = db.query(Portfolio).filter(
        and_(
            Portfolio.user_id == current_user.id,
            Portfolio.is_active == True
        )
    ).order_by(Portfolio.added_at.desc()).all()
    
    response = [PortfolioResponse.from_orm(item) for item in portfolio_items]
    
    # Cache result
    cache.set(cache_key, [item.json() for item in response], ttl=settings.STOCK_CACHE_TTL)
    
    return response


@router.post("/", response_model=PortfolioResponse)
async def add_to_portfolio(
    portfolio_data: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> PortfolioResponse:
    """Add stock to user's portfolio."""
    
    # Check if stock exists
    stock = db.query(Stock).filter(Stock.id == portfolio_data.stock_id).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )
    
    # Check if already in portfolio
    existing = db.query(Portfolio).filter(
        and_(
            Portfolio.user_id == current_user.id,
            Portfolio.stock_id == portfolio_data.stock_id,
            Portfolio.is_active == True
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock already in portfolio"
        )
    
    # Add to portfolio
    portfolio = Portfolio(
        user_id=current_user.id,
        stock_id=portfolio_data.stock_id,
        quantity=portfolio_data.quantity,
        average_price=portfolio_data.average_price,
        notes=portfolio_data.notes,
        is_active=True
    )
    
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    
    # Clear cache
    cache = get_cache()
    cache.delete(f"portfolio:{current_user.id}")
    cache.delete(f"portfolio:summary:{current_user.id}")
    
    return PortfolioResponse.from_orm(portfolio)


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: int,
    portfolio_update: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> PortfolioResponse:
    """Update portfolio item."""
    
    # Get portfolio item
    portfolio = db.query(Portfolio).filter(
        and_(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == current_user.id
        )
    ).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )
    
    # Update fields
    update_data = portfolio_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(portfolio, field):
            setattr(portfolio, field, value)
    
    db.commit()
    db.refresh(portfolio)
    
    # Clear cache
    cache = get_cache()
    cache.delete(f"portfolio:{current_user.id}")
    cache.delete(f"portfolio:summary:{current_user.id}")
    
    return PortfolioResponse.from_orm(portfolio)


@router.delete("/{portfolio_id}", response_model=dict)
async def remove_from_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Remove stock from user's portfolio."""
    
    portfolio = db.query(Portfolio).filter(
        and_(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == current_user.id
        )
    ).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found"
        )
    
    # Mark as inactive instead of deleting
    portfolio.is_active = False
    db.commit()
    
    # Clear cache
    cache = get_cache()
    cache.delete(f"portfolio:{current_user.id}")
    cache.delete(f"portfolio:summary:{current_user.id}")
    
    return {"message": "Stock removed from portfolio"}


@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> PortfolioSummary:
    """Get portfolio summary and performance."""
    
    cache_key = f"portfolio:summary:{current_user.id}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return PortfolioSummary.parse_raw(cached_result)
    
    # Get portfolio items
    portfolio_items = db.query(Portfolio).filter(
        and_(
            Portfolio.user_id == current_user.id,
            Portfolio.is_active == True
        )
    ).all()
    
    if not portfolio_items:
        return PortfolioSummary(
            total_value=0.0,
            total_cost=0.0,
            total_pnl=0.0,
            total_pnl_percent=0.0,
            positions_count=0,
            best_performer=None,
            worst_performer=None,
            last_updated=datetime.utcnow()
        )
    
    # Calculate summary
    total_value = sum(item.current_value for item in portfolio_items)
    total_cost = sum(item.total_cost for item in portfolio_items)
    total_pnl = total_value - total_cost
    total_pnl_percent = (total_pnl / total_cost * 100) if total_cost > 0 else 0.0
    
    # Find best and worst performers
    best_performer = max(portfolio_items, key=lambda x: x.unrealized_pnl_percent)
    worst_performer = min(portfolio_items, key=lambda x: x.unrealized_pnl_percent)
    
    response = PortfolioSummary(
        total_value=total_value,
        total_cost=total_cost,
        total_pnl=total_pnl,
        total_pnl_percent=total_pnl_percent,
        positions_count=len(portfolio_items),
        best_performer=PortfolioResponse.from_orm(best_performer),
        worst_performer=PortfolioResponse.from_orm(worst_performer),
        last_updated=datetime.utcnow()
    )
    
    # Cache result
    cache.set(cache_key, response.json(), ttl=settings.STOCK_CACHE_TTL)
    
    return response


@router.get("/analytics", response_model=PortfolioAnalytics)
async def get_portfolio_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> PortfolioAnalytics:
    """Get detailed portfolio analytics."""
    
    cache_key = f"portfolio:analytics:{current_user.id}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return PortfolioAnalytics.parse_raw(cached_result)
    
    # Get portfolio items
    portfolio_items = db.query(Portfolio).filter(
        and_(
            Portfolio.user_id == current_user.id,
            Portfolio.is_active == True
        )
    ).all()
    
    if not portfolio_items:
        return PortfolioAnalytics(
            total_value=0.0,
            total_cost=0.0,
            total_pnl=0.0,
            total_pnl_percent=0.0,
            positions_count=0,
            sector_allocation={},
            top_holdings=[],
            performance_history=[],
            risk_metrics={},
            last_updated=datetime.utcnow()
        )
    
    # Calculate basic metrics
    total_value = sum(item.current_value for item in portfolio_items)
    total_cost = sum(item.total_cost for item in portfolio_items)
    total_pnl = total_value - total_cost
    total_pnl_percent = (total_pnl / total_cost * 100) if total_cost > 0 else 0.0
    
    # Calculate sector allocation
    sector_allocation = {}
    for item in portfolio_items:
        if item.stock and item.stock.sector:
            sector = item.stock.sector
            value = item.current_value
            if sector not in sector_allocation:
                sector_allocation[sector] = 0.0
            sector_allocation[sector] += value
    
    # Convert to percentages
    for sector in sector_allocation:
        sector_allocation[sector] = (sector_allocation[sector] / total_value * 100) if total_value > 0 else 0.0
    
    # Get top holdings
    top_holdings = sorted(
        portfolio_items,
        key=lambda x: x.current_value,
        reverse=True
    )[:10]
    
    # Calculate risk metrics (simplified)
    risk_metrics = {
        "concentration_risk": max(sector_allocation.values()) if sector_allocation else 0.0,
        "position_count_risk": len(portfolio_items),
        "volatility_risk": "Medium",  # Simplified - would need historical data
        "diversification_score": len(sector_allocation)
    }
    
    response = PortfolioAnalytics(
        total_value=total_value,
        total_cost=total_cost,
        total_pnl=total_pnl,
        total_pnl_percent=total_pnl_percent,
        positions_count=len(portfolio_items),
        sector_allocation=sector_allocation,
        top_holdings=[PortfolioResponse.from_orm(item) for item in top_holdings],
        performance_history=[],  # Would need historical data
        risk_metrics=risk_metrics,
        last_updated=datetime.utcnow()
    )
    
    # Cache result
    cache.set(cache_key, response.json(), ttl=settings.STOCK_CACHE_TTL)
    
    return response


@router.post("/rebalance", response_model=dict)
async def rebalance_portfolio(
    target_allocations: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Generate portfolio rebalancing recommendations."""
    
    # Get current portfolio
    portfolio_items = db.query(Portfolio).filter(
        and_(
            Portfolio.user_id == current_user.id,
            Portfolio.is_active == True
        )
    ).all()
    
    if not portfolio_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Portfolio is empty"
        )
    
    # Calculate current allocations
    total_value = sum(item.current_value for item in portfolio_items)
    current_allocations = {}
    
    for item in portfolio_items:
        if item.stock and item.stock.sector:
            sector = item.stock.sector
            value = item.current_value
            if sector not in current_allocations:
                current_allocations[sector] = 0.0
            current_allocations[sector] += value
    
    # Convert to percentages
    for sector in current_allocations:
        current_allocations[sector] = (current_allocations[sector] / total_value * 100) if total_value > 0 else 0.0
    
    # Generate recommendations
    recommendations = []
    for sector, target_percent in target_allocations.items():
        current_percent = current_allocations.get(sector, 0.0)
        difference = target_percent - current_percent
        
        if abs(difference) > 5.0:  # Only recommend if difference is significant
            action = "buy" if difference > 0 else "sell"
            recommendations.append({
                "sector": sector,
                "current_allocation": current_percent,
                "target_allocation": target_percent,
                "difference": difference,
                "action": action,
                "target_value": total_value * (target_percent / 100),
                "current_value": total_value * (current_percent / 100)
            })
    
    return {
        "message": "Portfolio rebalancing recommendations generated",
        "current_total_value": total_value,
        "recommendations": recommendations,
        "current_allocations": current_allocations,
        "target_allocations": target_allocations
    }


@router.get("/export", response_model=dict)
async def export_portfolio(
    format: str = Query("csv", description="Export format"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Export portfolio data."""
    
    # Get portfolio items
    portfolio_items = db.query(Portfolio).filter(
        and_(
            Portfolio.user_id == current_user.id,
            Portfolio.is_active == True
        )
    ).all()
    
    if not portfolio_items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio is empty"
        )
    
    # Generate export data
    export_data = []
    for item in portfolio_items:
        export_data.append({
            "symbol": item.stock.symbol if item.stock else "",
            "name": item.stock.name if item.stock else "",
            "quantity": item.quantity,
            "average_price": float(item.average_price) if item.average_price else 0.0,
            "current_price": item.current_price,
            "current_value": item.current_value,
            "unrealized_pnl": item.unrealized_pnl,
            "unrealized_pnl_percent": item.unrealized_pnl_percent,
            "added_at": item.added_at.isoformat() if item.added_at else "",
            "notes": item.notes or ""
        })
    
    return {
        "message": "Portfolio data exported successfully",
        "format": format,
        "data": export_data,
        "exported_at": datetime.utcnow().isoformat(),
        "total_items": len(export_data)
    }
