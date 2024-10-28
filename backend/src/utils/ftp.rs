use crate::image::handlers::Image;
use crate::schema::images;
use crate::AppState;
use actix_web::{web, Error, HttpResponse};
use diesel::RunQueryDsl;
use ftp::FtpStream;
use serde::Deserialize;
use std::io::Read;

#[derive(Deserialize)]
pub struct Ftp {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

pub async fn ftp_setup_database (
    item: web::Json<Ftp>,
    db: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    println!("{}   {}   {}   {}", item.host, item.port, item.username, item.password);
    let mut ftp_stream =
        FtpStream::connect(item.host.as_str()).expect("Failed to connect");

    ftp_stream
        .login(item.username.as_str(), item.password.as_str())
        .expect("Failed to login");
    ftp_stream.cwd("lfw").expect("Failed to change dir");
    ftp_stream
        .transfer_type(ftp::types::FileType::Binary)
        .expect("Failed to set transfer type");
    let folders = ftp_stream.nlst(Option::from(".")).expect("Failed to list");
    let mut save_counter = 1;
    let mut image_save_vec: Vec<Image> = Vec::new();

    for folder in folders {
        let files = ftp_stream
            .nlst(Option::from(folder.as_str()))
            .expect("Failed to list");

        //entering image directory
        ftp_stream.cwd(&folder.clone()).expect("Failed to change dir");
        for file in files {
            //let remote_path = format!("{}/{}", folder, file);
            let remote_path = file.clone().split("/").last().unwrap().to_string();

            let mut remote_file = ftp_stream
                .simple_retr(&remote_path)
                .expect("Failed to retrieve file");

            let mut buffer = Vec::new();
            remote_file
                .read_to_end(&mut buffer)
                .expect("Failed to read file");

            let image = Image {
                id: save_counter,
                name: file,
                image: buffer,
            };
            image_save_vec.push(image);
            save_counter += 1;
        }
        //leave image directory
        ftp_stream.cwd("..").expect("Failed to change dir");


        // if image_save_vec.len() > 1000 {
        //     break;
        // }
    }
    //save the image vector to the database
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    diesel::insert_into(images::table)
        .values(&image_save_vec)
        .execute(&mut conn)
        .expect("Error saving new image");

    //print_photos_recursive(&mut ftp_stream, "lfw").await.expect("Could not change dir");
    //print_photos_recursive(&mut ftp_stream, "lfw").await.expect("");
    ftp_stream.quit().expect("Failed to quit");
    Ok(HttpResponse::Ok().body("Done"))
}
