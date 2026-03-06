/**
 * Shared image cropping utility.
 * Replicates the CSS `object-fit: cover` + translate/scale behavior
 * to produce a correctly cropped JPEG blob.
 */

interface CropParams {
    image: HTMLImageElement
    containerWidth: number
    containerHeight: number
    zoom: number
    offsetX: number
    offsetY: number
    outputWidth?: number
    outputHeight?: number
}

export async function getCroppedBlob({
    image,
    containerWidth,
    containerHeight,
    zoom,
    offsetX,
    offsetY,
    outputWidth = 1280,
    outputHeight = 720,
}: CropParams): Promise<Blob | null> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = outputWidth
    canvas.height = outputHeight

    // Step 1: Calculate "object-fit: cover" scale for the canvas.
    // This scales the image so it fully covers the canvas while preserving aspect ratio.
    const imgAspect = image.width / image.height
    const canvasAspect = canvas.width / canvas.height

    let coverScale: number
    if (imgAspect > canvasAspect) {
        // Image is wider than canvas aspect — scale by height
        coverScale = canvas.height / image.height
    } else {
        // Image is taller than canvas aspect — scale by width
        coverScale = canvas.width / image.width
    }

    // Step 2: Apply zoom on top of cover scale
    const finalScale = coverScale * zoom

    // Step 3: Calculate centered position (replicates object-fit: cover centering)
    const scaledW = image.width * finalScale
    const scaledH = image.height * finalScale
    const cx = (canvas.width - scaledW) / 2
    const cy = (canvas.height - scaledH) / 2

    // Step 4: Map the user's drag offset from container coords to canvas coords
    const ratioX = canvas.width / containerWidth
    const ratioY = canvas.height / containerHeight
    const canvasOffsetX = offsetX * ratioX
    const canvasOffsetY = offsetY * ratioY

    // Step 5: Draw — no background fill needed since cover always fills the canvas
    ctx.drawImage(
        image,
        cx + canvasOffsetX,
        cy + canvasOffsetY,
        scaledW,
        scaledH
    )

    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.92)
    })
}
