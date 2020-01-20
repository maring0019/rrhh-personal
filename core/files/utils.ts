import * as Jimp from 'jimp';

export async function processImage(buffer, opts?){
    let img = await Jimp.read(buffer);
    if (opts){
        if (opts.w && opts.h) img = await img.resize(opts.w, opts.h); 
        if (opts.w && !opts.h) img = await img.resize(opts.w, Jimp.AUTO);
        if (!opts.w && opts.h) img = await img.resize(Jimp.AUTO, opts.h); 
        if (opts.quality) img = await img.quality(opts.quality); 
        if (opts.greyscale) img = await img.greyscale(); 
    }
    buffer = await img.getBufferAsync(Jimp.MIME_JPEG);
    return buffer;
}