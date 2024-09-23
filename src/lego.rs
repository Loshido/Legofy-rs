extern crate rimage;

use rimage::{image::{imageops::FilterType::Triangle, DynamicImage, GenericImageView, Pixel, RgbImage}, Decoder};

pub fn legofy(img: DynamicImage, brick_size: u32) -> DynamicImage {
    let width = img.width();
    let height = img.height();

    // removing extra spaces (in case of half brick...)
    let brick_dimension = [
        width - width % brick_size, 
        height - height % brick_size
    ];

    let mut lego = RgbImage::new(brick_dimension[0], brick_dimension[1]);

    // La brick lego de référence
    let decoder = Decoder::from_path("./bucket/brick.jpg").unwrap();

    let brick = match decoder.decode() {
        Err(_) => panic!("brick.jpg needs to be in the bucket!"),
        Ok(result) => result
            .resize(brick_size, brick_size, Triangle)
    };

    // passe sur chaque brick pour faire la moyenne 
    // des valeurs des canaux red, green et blue.

    // div_euclid == % (reste de la division euclidienne)
    // 8.div_euclid(3) == 2 <=> // in python
    for i in 0 .. width.div_euclid(brick_size) {
        for j in 0 .. height.div_euclid(brick_size) {
            let x = i * brick_size;
            let y = j * brick_size;

            // moyenne de chaque canal
            let mut channels: [u64; 3] = [0, 0, 0]; // somme
            let mut compteur = 0;
            
            for xi in x .. x + brick_size {
                for yj in y .. y + brick_size {
                    let pixel = img.get_pixel(xi, yj).0;
                    for i in 0..3 {
                        channels[i] += u64::from(pixel[i]);
                    };
                    compteur += 1;
                }
            }

            for i in 0..3 {
                channels[i] = channels[i].div_euclid(compteur);
            };
            
            // On passe sur chaque pixel pour 
            // assigner la moyenne de la brick
            // & multiplier par la couleur du pixel qui se trouve au même 
            // endroit sur l'image de la brick (oui c'est complexe)

            for xi in x .. x + brick_size {
                for yj in y .. y + brick_size {
                    // xi est l'index x sur la largeur de l'image.
                    // xi - x est l'index x sur la brick (0, 1, 2...)

                    let brick_pixel = brick.get_pixel(xi - x, yj - y).0;
                    let diff: [u64; 3] = [
                        u64::from(brick_pixel[0]),
                        u64::from(brick_pixel[1]),
                        u64::from(brick_pixel[2])
                    ];

                    // u64 parce que u8 * u8 > à la taille max d'un u8
                    let new_pixel: [u8; 3] = [
                        u8::try_from(channels[0] * diff[0] / 255).unwrap(),
                        u8::try_from(channels[1] * diff[1] / 255).unwrap(),
                        u8::try_from(channels[2] * diff[2] / 255).unwrap()
                    ];

                    let pixel = Pixel::from_slice(&new_pixel);
                    lego.put_pixel(xi, yj, *pixel);
                }
            }
        }
    }
    DynamicImage::ImageRgb8(lego)
}