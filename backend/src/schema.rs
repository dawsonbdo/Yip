table! {
    comments (id) {
        id -> Uuid,
        reviewid -> Uuid,
        authorid -> Uuid,
        date_posted -> Date,
        comment_text -> Varchar,
    }
}

table! {
    kennels (id) {
        id -> Uuid,
        name -> Varchar,
        tags -> Array<Text>,
        mods -> Array<Uuid>,
    }
}

table! {
    reviews (id) {
        id -> Uuid,
        kennelid -> Uuid,
        title -> Varchar,
        author -> Uuid,
        date_posted -> Date,
        review_text -> Varchar,
        images -> Array<Text>,
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
    comments,
    kennels,
    reviews,
    users,
);
