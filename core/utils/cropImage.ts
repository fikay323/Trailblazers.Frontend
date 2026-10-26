export interface PixelCrop {
	x: number;
	y: number;
	width: number;
	height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', (error: unknown) => reject(error));
		image.setAttribute('crossOrigin', 'anonymous');
		image.src = url;
	});

export async function getCroppedImg(
	imageSrc: string,
	pixelCrop: PixelCrop,
	outputWidth?: number,
	outputHeight?: number
): Promise<Blob> {
	const image = await createImage(imageSrc);
	const canvas = document.createElement('canvas');

	// If explicit dimensions are provided, use them; otherwise use pixelCrop size capped at 2400px
	let targetWidth = outputWidth ?? Math.round(pixelCrop.width);
	let targetHeight = outputHeight ?? Math.round(pixelCrop.height);

	// Cap large dimensions to 2400px to avoid memory overflow while preserving crispness
	const maxDimension = 2400;
	if (targetWidth > maxDimension || targetHeight > maxDimension) {
		const scale = maxDimension / Math.max(targetWidth, targetHeight);
		targetWidth = Math.round(targetWidth * scale);
		targetHeight = Math.round(targetHeight * scale);
	}

	canvas.width = Math.max(1, targetWidth);
	canvas.height = Math.max(1, targetHeight);
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Canvas 2D context unavailable');
	}

	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';

	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		canvas.width,
		canvas.height
	);

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error('Canvas export to blob failed'));
				}
			},
			'image/webp',
			0.92
		);
	});
}
