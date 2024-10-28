use std::fmt;
use std::fmt::{Debug, Display, Formatter};
use actix_web::dev::ServiceRequest;
use actix_web::{Error, HttpResponse, ResponseError};
use actix_web_httpauth::extractors::basic::BasicAuth;
use crate::AppState;
use crate::user::repository::find_user_by_username;

