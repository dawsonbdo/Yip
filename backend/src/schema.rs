table! {
    reviews (id) {
        id -> Uuid,
        kennelid -> Uuid,
        title -> Varchar,
        author -> Uuid,
        date_posted -> Date,
        review_text -> Varchar,
        images -> Json,
        rating -> Int4,
        tags -> Json,
    }
}

table! {
    users (id) {
        id -> Uuid,
        username -> Varchar,
        email -> Varchar,
        password -> Varchar,
        profilepic -> Varchar,
        sitewideban -> Bool,
    }
}

allow_tables_to_appear_in_same_query!(
    reviews,
    users,
);
