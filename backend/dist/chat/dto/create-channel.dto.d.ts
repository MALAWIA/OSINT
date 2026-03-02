export declare enum ChannelType {
    STOCK = "stock",
    GENERAL = "general",
    SECTOR = "sector"
}
export declare class CreateChannelDto {
    name: string;
    channelType: ChannelType;
    description?: string;
    companyId?: string;
}
