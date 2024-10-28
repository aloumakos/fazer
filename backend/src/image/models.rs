use crate::schema::images;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Queryable, Serialize)]
pub struct Image {
    pub id: i32,
    pub filename: String,
    pub content_type: String,
    pub data: Vec<u8>,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = images)]
pub struct NewImage<'a> {
    pub name: &'a str,
    pub image: &'a [u8],
}

#[derive(Deserialize)]
pub struct ImageId {
    pub(crate) id: i32,
}
