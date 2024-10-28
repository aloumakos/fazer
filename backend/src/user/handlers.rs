use crate::user::models::User;
use crate::user::repository::{add_single_user, db_get_user_by_id};
use crate::AppState;
use actix_web::web::Json;
use actix_web::{web, HttpResponse, HttpResponseBuilder};
use serde::{Deserialize, Serialize};

struct UserDel {
    id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InputUser {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub username: String,
    pub password: String,
}

#[derive(Deserialize, Debug)]
pub struct GetUserData {
    id: i32,
}

// pub async fn get_all_users(
//     db: web::Data<AppState>,
// ) -> Result<HttpResponse, Error> {
//     Ok(web::block(move || other_get_all_users(db))
//         .await
//         .map(|user| HttpResponse::Ok().json(user))
//         .map_err(|_| HttpResponse::InternalServerError())
//         .unwrap_or_else(|_| HttpResponse::from(HttpResponse::InternalServerError())))
// }



pub async fn get_user_by_id(
    db: web::Data<AppState>,
    user_id: Json<GetUserData>,
) -> HttpResponseBuilder {
    let res = web::block(move || db_get_user_by_id(db, user_id.id))
        .await
        .map(|_| HttpResponse::Ok())
        .map_err(|_| HttpResponse::InternalServerError())
        .unwrap_or_else(|_| HttpResponse::InternalServerError());
    res
}

pub async fn add_user(
    db: web::Data<AppState>,
    item: Json<InputUser>,
) -> HttpResponseBuilder {
    let res = web::block(move || add_single_user(db, item))
        .await
        .map(|_| HttpResponse::Ok())
        .map_err(|_| HttpResponse::InternalServerError())
        .unwrap_or_else(|_|HttpResponse::InternalServerError());
    res
}

//Handler for DELETE /users/{id}
// pub async fn delete_user(
//     db: web::Data<AppState>,
//     user_id: Json<UserDel>,
// ) -> Result<HttpResponse, Error> {
//     Ok(web::block(move || delete_single_user(db, Json::from(User::from(user_id))))
//         .await
//         .map(|user| HttpResponse::Ok().json(user))
//         .map_err(|_| HttpResponse::InternalServerError())
//         .unwrap_or_else(|_| HttpResponse::from(HttpResponse::InternalServerError())))
// }

impl From<Json<UserDel>> for User {
    fn from(user: Json<UserDel>) -> Self {
        User {
            id: user.id,
            first_name: "".to_string(),
            last_name: "".to_string(),
            email: "".to_string(),
            username: "".to_string(),
            password: "".to_string(),
        }
    }
}

// make User a json
impl From<User> for Json<User> {
    fn from(user: User) -> Self {
        Json(User {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            username: user.username,
            password: user.password,
        })
    }
}
