// @generated automatically by Diesel CLI.

diesel::table! {
    images (id) {
        id -> Int4,
        name -> Text,
        image -> Bytea,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        first_name -> Text,
        last_name -> Text,
        email -> Text,
        password -> Text,
        username -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(images, users,);
