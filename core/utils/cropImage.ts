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
	outputWidth: number = 500,
	outputHeight: number = 500
): Promise<Blob> {
	const image = await createImage(imageSrc);
	const canvas = document.createElement('canvas');
	canvas.width = outputWidth;
	canvas.height = outputHeight;
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
		outputWidth,
		outputHeight
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
			0.9
		);
	});
}
