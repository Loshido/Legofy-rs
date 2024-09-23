mod lego;
#[macro_use] extern crate rocket;

use std::io::Cursor;

use lego::legofy;
use rocket::{
    data::ToByteUnit, fs::FileServer,
    http::ContentType, response::status::BadRequest, Data
};
use rimage::image::{load_from_memory, ImageFormat::Png};

#[post("/<brick_size>", data = "<data>")]
async fn handle(brick_size: usize, data: Data<'_>) -> Result<(ContentType, Vec<u8>), BadRequest<&'static str>> {
    let stream = data.open(16.megabytes())
        .into_bytes().await.map_err(|_| BadRequest("Failed to read data"))?;
    let image = load_from_memory(&stream).map_err(|_| BadRequest("Failed to decode image"))?;

    let legofied = legofy(image, brick_size as u32);
    let mut buffer = Cursor::new(Vec::new());
    legofied.write_to(&mut buffer, Png)
        .map_err(|_| BadRequest("Failed to encode image"))?;

    Ok((ContentType::PNG, buffer.into_inner()))
    // Ok(buffer)
}


#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", FileServer::from("/app/static"))
        .mount("/legofy", routes![handle])
}