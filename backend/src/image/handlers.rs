use std::ffi::{c_float, c_int};
use crate::image::models;
use crate::image::models::ImageId;
use crate::schema::images;
use crate::AppState;
use actix_web::http::header;
use actix_web::web::{Bytes};
use actix_web::{web, Error, HttpResponse, Responder};
use diesel::prelude::*;
use diesel::RunQueryDsl;
use futures::{StreamExt, TryStreamExt};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use actix_multipart::Multipart;
use reqwest::multipart;
use walkdir::WalkDir;

//Image struct
#[derive(Queryable, Serialize, Deserialize, Insertable)]
pub struct Image {
    pub id: i32,
    pub name: String,
    pub image: Vec<u8>,
}

#[derive(Insertable, Serialize, Deserialize)]
#[diesel(table_name = images)]
pub struct NewImage {
    pub name: String,
    pub image: Vec<u8>,
}

#[allow(dead_code)]
async fn serve_images_from_something(directory: String) -> impl Responder {
    //A directory
    let path = PathBuf::from(directory);
    let mut files = Vec::new();
    for entry in WalkDir::new(path) {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            files.push(path.to_str().unwrap().to_string());
        }
    }
    HttpResponse::Ok().json(files)
}

#[allow(dead_code)]
pub async fn upload_image_db(
    mut payload: Multipart,
    db: web::Data<AppState>,
) -> Result<HttpResponse, HttpResponse> {
    let mut image = Image {
        id: 0,
        name: String::new(),
        image: Vec::new(),
    };

    while let Some(mut field) = payload.try_next().await.unwrap() {
        let content_disposition = field.content_disposition();
        let filename = content_disposition.get_filename().unwrap();

        //save image to database
        image = Image {
            id: 0,
            name: filename.to_string(),
            image: field.next().await.unwrap().unwrap().to_vec(),
        };

        while let Some(chunk) = field.try_next().await.unwrap() {
            image.image.extend_from_slice(&chunk);
        }
    }

    let new_image = NewImage {
        name: image.name.clone(),
        image: image.image.clone(),
    };
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    diesel::insert_into(images::table)
        .values(&new_image)
        .execute(&mut conn)
        .expect("Error saving new image");

    Ok(HttpResponse::Ok().into())
}

pub async fn upload_images(
    db: web::Data<AppState>,
    mut payload: Multipart,
) -> Result<HttpResponse, Error> {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    while let Ok(Some(mut field)) = payload.try_next().await {
        let content_type = field.content_disposition().clone();
        let filename = content_type.get_filename().unwrap();
        let mut buffer = Vec::new();
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            buffer.extend_from_slice(&data);
        }
        let new_image = models::NewImage {
            name: filename,
            image: &buffer,
        };
        diesel::insert_into(images::table)
            .values(&new_image)
            .execute(&mut conn)
            .expect("Error saving new image");
    }
    //close connection
    drop(conn);
    Ok(HttpResponse::Ok().into())
}

pub async fn get_single_image_as_json(
    db: web::Data<AppState>,
    id: web::Json<ImageId>,
) -> HttpResponse {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    let image = images::table
        .find(id.id)
        .first::<Image>(&mut conn)
        .expect("Error loading image");

    HttpResponse::Ok()
        .content_type("image/png")
        .append_header((header::CONTENT_DISPOSITION, "attachment;".to_string()))
        .body(Bytes::from(image.image))
}

pub async fn serve_image(
    db: web::Data<AppState>,
    id: web::Json<ImageId>,
) -> HttpResponse {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    let image = images::table
        .find(id.id)
        .first::<Image>(&mut conn)
        .expect("Error loading image");

    HttpResponse::Ok()
        .content_type("image/png")
        .append_header((header::CONTENT_DISPOSITION, "attachment;".to_string()))
        .body(Bytes::from(image.image))
}

pub async fn serve_base64_image(
    db: web::Data<AppState>,
    id: web::Json<ImageId>,
) -> HttpResponse {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    let image = images::table
        .find(id.id)
        .first::<Image>(&mut conn)
        .expect("Error loading image");

    let base64_image = base64::encode(image.image);

    HttpResponse::Ok().json(base64_image)
}

pub async fn upload_image_to_python(
    mut payload: Multipart,
    db: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    //create 2d vector of images
    let mut image = Vec::new();
    // getting python url from .env file
    let mut python_url = dotenv::var("PYTHON_URL").expect("PYTHON_URL must be set");
    python_url.push_str("/get_faces");

    // getting image from request
    while let Some(mut field) = payload.try_next().await.unwrap() {

        
        image = field.next().await.unwrap().unwrap().to_vec();

        while let Some(chunk) = field.try_next().await.unwrap() {
            image.extend_from_slice(&chunk);
        }
    }

    let image_upload = image.clone();

    // creating multipart image form
    let form = multipart::Form::new()
        // Add a new Part to the form for the binary data
        .part("file", multipart::Part::bytes(image_upload).file_name("image.jpg"));

    // sending request to python server
    let client = reqwest::Client::new();
    let res = client
        .post(python_url.as_str())
        .header("Content-Type", "image/jpeg")
        .multipart(form)
        .send()
        .await
        .unwrap();

    let mut finalised_json = FinalJson {
        faces: Vec::new(),
        results: Vec::new(),
    };
    // getting response from python server as json of arrays
    let my_data: MyData = serde_json::from_str(&res.text().await.unwrap())?;
    // parse all coordinates results from python server to a vector
    for float in my_data.faces {
        let mut float_vec: Vec<f64> = Vec::new();
        for point in float {
            float_vec.push(point);
        }
        finalised_json.faces.push(float_vec);
    }

    let mut conn = db.pool.lock().unwrap().get().unwrap();
    let mut images = Vec::new();
    //search db for images based on results vector
    for result in my_data.results {
        let mut image_vec: Vec<String> = Vec::new();

        for i in result {
            println!("i: {}", i);
            images = images::table
                .filter(images::id.eq(i))
                .load::<Image>(&mut conn)
                .unwrap_or_else(|_| vec![]);

            let base64_image = base64::encode(images[0].image.clone());

            image_vec.push(base64_image);
        }

        finalised_json.results.push(image_vec.clone());
        //
        // let mut image_vec: Vec<String> = Vec::new();
        // //parse images to base64
        // for image in images {
        //     let base64_image = base64::encode(image.image);
        //     image_vec.push(base64_image);
        // }
        // finalised_json.results.push(image_vec);
    }

    match serde_json::to_string(&finalised_json) {
        Ok(json) => {
            Ok(HttpResponse::Ok()
                .content_type("application/json")
                .append_header((header::CONTENT_DISPOSITION, "attachment;".to_string()))
                .body(json.to_string()))
        }
        Err(_) => {
            Ok(HttpResponse::InternalServerError()
                .content_type("application/json")
                .append_header((header::CONTENT_DISPOSITION, "attachment;".to_string()))
                .body("Error".to_string()))
        }
    }
}

#[derive(Deserialize, Debug)]
struct MyData {
    faces: Vec<Vec<f64>>,
    results: Vec<Vec<c_int>>,
}

#[derive(Serialize, Deserialize)]
struct FinalJson {
    faces: Vec<Vec<f64>>,
    results: Vec<Vec<String>>,
}