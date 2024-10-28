use crate::schema::users::dsl::users;
use crate::user::handlers::InputUser;
use crate::user::models::{NewUser, User};
use crate::AppState;
use actix_web::web::{Data, Json};
use diesel::{delete, insert_into, QueryDsl, RunQueryDsl};
//fix .eq() not not implemented traits
use diesel::ExpressionMethods;

#[allow(dead_code)]
pub fn get_all_users(app_state: Data<AppState>) -> Result<Vec<User>, diesel::result::Error> {
    let mut conn = app_state
        .pool
        .lock()
        .unwrap()
        .get()
        .unwrap_or_else(|_| panic!("Failed to get connection"));
    let items = users
        .load::<User>(&mut conn)
        .unwrap_or_else(|_| panic!("Failed to load users"));
    Ok(items)
}

pub fn db_get_user_by_id(
    pool: Data<AppState>,
    user_id: i32,
) -> Result<User, diesel::result::Error> {
    let mut conn = pool.pool.lock().unwrap().get().unwrap();
    users.find(user_id).get_result::<User>(&mut conn)
}

#[allow(dead_code)]
pub fn delete_single_user(
    db: Data<AppState>,
    user_id: Json<User>,
) -> Result<usize, diesel::result::Error> {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    let count = delete(users.find(user_id.id)).execute(&mut conn)?;
    Ok(count)
}

pub fn add_single_user(
    db: Data<AppState>,
    item: Json<InputUser>,
) -> Result<User, diesel::result::Error> {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    let new_user = NewUser {
        first_name: &item.first_name,
        last_name: &item.last_name,
        email: &item.email,
        username: &item.email,
        password: &item.email,
    };

    let res = insert_into(users).values(&new_user).get_result(&mut conn)?;
    Ok(res)
}

#[allow(dead_code)]
pub fn find_user_by_username(
    db: &&AppState,
    username: String,
) -> Result<User, diesel::result::Error> {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    users
        .filter(crate::schema::users::dsl::username.eq(username))
        .first::<User>(&mut conn)
}

#[allow(dead_code)]
pub fn find_user_by_email(
    db: Data<AppState>,
    email: String,
) -> Result<User, diesel::result::Error> {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    users
        .filter(crate::schema::users::dsl::email.eq(email))
        .first::<User>(&mut conn)
}

#[allow(dead_code)]
pub fn find_user_by_id(db: Data<AppState>, id: i32) -> Result<User, diesel::result::Error> {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    users
        .filter(crate::schema::users::dsl::id.eq(id))
        .first::<User>(&mut conn)
}

//TODO: find users by another linked table column
#[allow(dead_code)]
pub fn find_users_by_something(
    db: Data<AppState>,
    something: String,
) -> Result<Vec<User>, diesel::result::Error> {
    let mut conn = db.pool.lock().unwrap().get().unwrap();
    users
        .filter(crate::schema::users::dsl::email.eq(something))
        .load::<User>(&mut conn)
}
