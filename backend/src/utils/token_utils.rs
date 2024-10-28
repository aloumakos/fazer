// use crate::user::models::User;
// use crate::AppState;
// use actix_web::web;
// use diesel::row::NamedRow;
// use jsonwebtoken::{DecodingKey, TokenData, Validation};
//
// pub fn decode_token(token: String) -> jsonwebtoken::errors::Result<TokenData<UserToken>> {
//     jsonwebtoken::decode::<UserToken>(
//         &token,
//         &DecodingKey::from_secret(&KEY),
//         &Validation::default(),
//     )
// }
//
// pub fn verify_token(
//     token_data: &TokenData<UserToken>,
//     pool: &web::Data<AppState>,
// ) -> Result<String, String> {
//     if User::is_valid_login_session(&token_data.claims, &pool.get().unwrap()) {
//         Ok(token_data.claims.user.to_string())
//     } else {
//         Err("Invalid token".to_string())
//     }
// }
