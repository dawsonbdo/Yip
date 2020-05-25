table! {
    block_relationships (pkey) {
        pkey -> Int8,
        blocker -> Uuid,
        blockee -> Uuid,
    }
}

table! {
    bookmarks (pkey) {
        pkey -> Int8,
        user -> Uuid,
        review -> Uuid,
        timestamp -> Timestamp,
    }
}

table! {
    comment_dislike_relationships (pkey) {
        pkey -> Int8,
        disliker -> Uuid,
        comment -> Uuid,
    }
}

table! {
    comment_like_relationships (pkey) {
        pkey -> Int8,
        liker -> Uuid,
        comment -> Uuid,
    }
}

table! {
    comments (comment_uuid) {
        comment_uuid -> Uuid,
        review_uuid -> Uuid,
        author_uuid -> Uuid,
        timestamp -> Timestamp,
        text -> Varchar,
        author_name -> Varchar,
        rating -> Int4,
    }
}

table! {
    kennel_bans (pkey) {
        pkey -> Int8,
        banned_reviewer -> Uuid,
        kennel -> Uuid,
    }
}

table! {
    kennel_follow_relationships (pkey) {
        pkey -> Int8,
        follower -> Uuid,
        kennel -> Uuid,
    }
}

table! {
    kennels (kennel_uuid) {
        kennel_uuid -> Uuid,
        tags -> Nullable<Array<Text>>,
        kennel_name -> Varchar,
        follower_count -> Int4,
        muted_words -> Nullable<Array<Text>>,
        rules -> Nullable<Varchar>,
        mod_uuid -> Uuid,
        description -> Varchar,
    }
}

table! {
    messages (pkey) {
        sender -> Uuid,
        recipient -> Uuid,
        text -> Text,
        timestamp -> Timestamp,
        pkey -> Int8,
        seen -> Bool,
    }
}

table! {
    moderators (kennel) {
        reviewer -> Uuid,
        kennel -> Uuid,
    }
}

table! {
    reports (report_uuid) {
        report_uuid -> Uuid,
        kennel -> Uuid,
        is_comment -> Bool,
        comment_id -> Nullable<Uuid>,
        review_id -> Nullable<Uuid>,
        reason -> Varchar,
        escalated -> Bool,
        reporter_name -> Varchar,
        timestamp -> Timestamp,
    }
}

table! {
    review_dislike_relationships (pkey) {
        pkey -> Int8,
        disliker -> Uuid,
        review -> Uuid,
    }
}

table! {
    review_like_relationships (pkey) {
        pkey -> Int8,
        liker -> Uuid,
        review -> Uuid,
    }
}

table! {
    reviewer_follow_relationships (pkey) {
        pkey -> Int8,
        follower -> Uuid,
        followee -> Uuid,
    }
}

table! {
    reviews (review_uuid) {
        review_uuid -> Uuid,
        kennel_uuid -> Uuid,
        title -> Varchar,
        author -> Uuid,
        timestamp -> Timestamp,
        text -> Varchar,
        tags -> Nullable<Array<Text>>,
        hotness -> Nullable<Float8>,
        images -> Nullable<Array<Text>>,
        kennel_name -> Varchar,
        author_name -> Varchar,
        rating -> Int4,
    }
}

table! {
    users (profile_uuid) {
        profile_uuid -> Uuid,
        username -> Varchar,
        email -> Varchar,
        password -> Varchar,
        profilepicture -> Nullable<Text>,
        sitewideban -> Bool,
    }
}

joinable!(comment_dislike_relationships -> comments (comment));
joinable!(comment_dislike_relationships -> users (disliker));
joinable!(comment_like_relationships -> comments (comment));
joinable!(comment_like_relationships -> users (liker));
joinable!(kennel_bans -> kennels (kennel));
joinable!(kennel_bans -> users (banned_reviewer));
joinable!(kennel_follow_relationships -> kennels (kennel));
joinable!(kennel_follow_relationships -> users (follower));
joinable!(moderators -> kennels (kennel));
joinable!(moderators -> users (reviewer));
joinable!(reports -> comments (comment_id));
joinable!(reports -> kennels (kennel));
joinable!(reports -> reviews (review_id));
joinable!(review_dislike_relationships -> reviews (review));
joinable!(review_dislike_relationships -> users (disliker));
joinable!(review_like_relationships -> reviews (review));
joinable!(review_like_relationships -> users (liker));
joinable!(reviews -> users (author));

allow_tables_to_appear_in_same_query!(
    block_relationships,
    bookmarks,
    comment_dislike_relationships,
    comment_like_relationships,
    comments,
    kennel_bans,
    kennel_follow_relationships,
    kennels,
    messages,
    moderators,
    reports,
    review_dislike_relationships,
    review_like_relationships,
    reviewer_follow_relationships,
    reviews,
    users,
);
