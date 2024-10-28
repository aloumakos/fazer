use std::io::Read;
use actix_web::{HttpResponse, HttpResponseBuilder, web};
use diesel::RunQueryDsl;
use crate::AppState;
use crate::image::handlers::{Image};
use crate::schema::images;

pub(crate) async fn setup_images(url: String, db: web::Data<AppState>,) -> HttpResponseBuilder {
    // Make HTTP request to download tar file
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    let response = reqwest::get(url).await;
    let body_bytes = response.unwrap().bytes().await.unwrap();
    let mut id_count = 1;
    //unzip using gunzip
    let decoder = flate2::read::GzDecoder::new(body_bytes.as_ref());
    let mut image_vec: Vec<Image> = Vec::new();
    // extract tar file in memory
    let mut archive = tar::Archive::new(decoder);

    // iterate over all entries in the tar file
    for entry in archive.entries().unwrap() {
        let mut file = entry.unwrap();
        let mut buffer = Vec::new();
        let is_file = file.path().unwrap().extension().is_some().clone();
        if !is_file {
            continue;
        }
        file.read_to_end(&mut buffer).unwrap();

        let image = Image {
            id: id_count,
            name: file.path().unwrap().to_str().unwrap().to_string(),
            image: buffer,
        };
        image_vec.push(image);
        id_count+=1;
    }

    diesel::insert_into(images::table)
        .values(&image_vec)
        .execute(&mut conn)
        .expect("Error saving new image");



    // let mut file = File::create("test.tar.gz").unwrap();
    //return all ok responser
    return HttpResponse::Ok();
}