export interface SiteAsset {
	key: string;
	group: string;
	imageUrl: string;
	publicId?: string | null;
	altText?: string | null;
	title?: string | null;
	caption?: string | null;
	metadataJson?: string | null;
	sortOrder: number;
	updatedAt: string;
}

export interface UpdateSiteAssetPayload {
	group?: string;
	imageUrl: string;
	publicId?: string | null;
	altText?: string | null;
	title?: string | null;
	caption?: string | null;
	metadataJson?: string | null;
	sortOrder?: number;
}

export interface ReorderItemPayload {
	key: string;
	sortOrder: number;
}

export interface ReorderSiteAssetsPayload {
	items: ReorderItemPayload[];
}

export interface MediaUploadResponse {
	url: string;
	publicId: string;
	fileName: string;
	fileSizeBytes: number;
}
