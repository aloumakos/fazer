extern crate core;

use std::fmt;
use std::fmt::{Debug, Display, Formatter};
use crate::dbms::handlers::set_database_connection;
use crate::image::handlers::{get_single_image_as_json, serve_base64_image, serve_image, upload_image_to_python, upload_images};
use crate::schema::users::dsl::users;
use crate::user::handlers::{add_user, get_user_by_id};
use crate::user::models::{NewUser, User};
use crate::utils::ftp::ftp_setup_database;
use actix_web::{middleware, web, App, HttpServer, ResponseError, HttpResponse, Error, http};
use diesel::r2d2::ConnectionManager;
use diesel::{insert_into, PgConnection, RunQueryDsl};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use r2d2_postgres::r2d2::Pool;
use std::sync::Mutex;
use std::time::Duration;
use actix_cors::Cors;
use actix_web::dev::ServiceRequest;
use actix_web_httpauth::extractors::basic::BasicAuth;
use crate::user::repository::find_user_by_username;
use crate::utils::setup::setup_images;

mod dbms;
mod image;
mod schema;
mod user;
mod utils;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

pub struct AppState {
    pool: Mutex<Pool<ConnectionManager<PgConnection>>>,
}

fn run_migration(conn: &mut PgConnection) {
    conn.run_pending_migrations(MIGRATIONS).unwrap();
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    //setup environment variables
    dotenv::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let pool = Pool::builder()
        .max_size(10)
        .idle_timeout(Some(Duration::from_secs(20)))
        .connection_timeout(Duration::from_secs(20))
        .build(manager)
        .unwrap();

    run_migration(&mut pool.get().unwrap());

    ///////////////////////////////////////Test/////////////////////////////////////////////////
    let mut conn = pool.get().unwrap();
    let items = users
        .load::<User>(&mut conn)
        .unwrap_or_else(|_| panic!("Failed to load users"));

    //check if db is empty
    if items.is_empty() {
        let mut conn = pool.get().unwrap();
        let new_user = NewUser {
            first_name: "Bobby",
            last_name: "Smith",
            email: "bobby@smith.com",
            username: "bobby",
            password: "bobbypass",
        };

        let res: bool = insert_into(users)
            .values(&new_user)
            .execute(&mut conn)
            .is_ok();

        if res {
            log::info!("User added");
        } else {
            panic!("User not added");
        }
    }
    ////////////////////////////////////////////////////


    HttpServer::new(move || {
        //let auth = HttpAuthentication::basic(validator);

        App::new()
            .route("/mmap_test", web::post().to(test_mmap))
            .wrap(middleware::Logger::default())
            .wrap(
                Cors::default() // allowed_origin return access-control-allow-origin: * by default
                    .allowed_origin("http://127.0.0.1:8080")
                    .allowed_origin("http://localhost:8080")
                    .allowed_origin("http://localhost:2000")
                    .allowed_methods(vec!["GET", "POST"])
                    .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
                    .allowed_header(http::header::CONTENT_TYPE)
                    .max_age(3600),
            )
            .wrap(middleware::Compress::default())
            .wrap(middleware::Logger::default())
            .app_data(web::Data::new(AppState {
                pool: Mutex::new(pool.clone()),
            }))
            .default_service(web::route().to(|| async { "Hello world!" }))
            .route("/register", web::post().to(add_user))
            .route("/setup-images", web::post().to(setup_images))
            .route("/test", web::get().to(index))
            .route("/test2", web::post().to(test))
            .route("/get_faces", web::post().to(upload_image_to_python))
            .service(
                web::scope("/secured")
                    //.wrap(auth)
                    .route("/users/by_id", web::post().to(get_user_by_id))
                    .route("/upload_images", web::post().to(upload_images))
                    .route("/get_image", web::get().to(get_single_image_as_json))
                    .route("/serve_image", web::post().to(serve_image))
                    .route("/serve_encoded_image", web::post().to(serve_base64_image))
                    .route("/ftp_setup", web::post().to(ftp_setup_database))
                    .route("/set_db_connection", web::post().to(set_database_connection))
            )
    })
        .bind("0.0.0.0:8080")?
        .run()
        .await
}

pub async fn validator(
    req: ServiceRequest,
    _credentials: BasicAuth,
) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    //check if db is empty
    println!("{:?}", req);
    //Get username and password from BasicAuth
    let username = _credentials.user_id().to_string();
    let password = _credentials.password().unwrap().to_string();

    let user = find_user_by_username(&req.app_data::<AppState>().unwrap(), username).unwrap();
    //check if password is correct
    if user.password != password {
        return Err((Error::from(MyError), req));
    }

    Ok(req)


    // //Check if username and password exist in db
    // //TODO: check from db
    // if username == "bobby" && password == "bobbypass" {
    //     Ok(req)
    // } else {
    //     Err((Error::from(MyError), req))
    // }

    //get user from db
    // let user = find_user_by_username(&req.app_data::<AppState>().unwrap(), username).unwrap();
    // //check if password is correct
    // if user.password != password {
    //     return Err(Error::from(
    //         HttpResponse::Unauthorized().json("Invalid credentials"),
    //     ));
    // }
}


struct MyError;


impl Display for MyError {
    fn fmt(&self, _f: &mut Formatter<'_>) -> fmt::Result {
        todo!()
    }
}

impl Debug for MyError {
    fn fmt(&self, _f: &mut Formatter<'_>) -> fmt::Result {
        todo!()
    }
}

impl ResponseError for MyError {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::Unauthorized()
            .content_type("text/plain")
            .body("Not authorized")
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////
use actix_session::Session;
use serde_derive::{Deserialize, Serialize};
use crate::utils::testing::test_mmap;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct Usertest {
    username: String,
    password: String,
}

async fn test (
    session: Session,
    authorization: BasicAuth,
) -> Result<HttpResponse, actix_web::Error> {
    let username = authorization.user_id().to_string();
    let password = authorization.password().unwrap().to_string();
    // Check if the user is authenticated
    if session.get::<User>("user").is_ok() {
        return Ok(HttpResponse::SeeOther()
            .append_header(("location", "/"))
            .finish());
    }

    // Check if the login credentials are correct
    if username == "test" && password == "test" {
        session.insert("user", username)?;
        Ok(HttpResponse::SeeOther()
            .append_header(("location", "/"))
            .append_header(("JSESSIONID", "1234567890"))
            .finish())
    } else {
        Ok(HttpResponse::Unauthorized().finish())
    }
}

async fn index(session: Session) -> Result<HttpResponse, actix_web::Error> {
    // Check if the user is authenticated
    if let Some(user) = session.get::<User>("user").ok().flatten() {
        Ok(HttpResponse::Ok().body(format!("Hello, {}!", user.username)))
    } else {
        Ok(HttpResponse::Unauthorized().finish())
    }
}