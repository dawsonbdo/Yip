table! {
    block_relationships (blocker) {
        blocker -> Uuid,
        blockee -> Uuid,
    }
}

table! {
    comment_dislike_relationships (comment) {
        disliker -> Uuid,
        comment -> Uuid,
    }
}

table! {
    comment_like_relationships (comment) {
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
    }
}

table! {
    kennel_bans (kennel) {
        banned_reviewer -> Uuid,
        kennel -> Uuid,
    }
}

table! {
    kennel_follow_relationships (id) {
        follower -> Uuid,
        kennel -> Uuid,
        id -> Int4,
    }
}

table! {
    kennels (kennel_uuid) {
        kennel_uuid -> Uuid,
        tags -> Nullable<Array<Text>>,
        kennel_name -> Varchar,
    }
}

table! {
    messages (message_uuid) {
        message_uuid -> Uuid,
        sender -> Uuid,
        recipient -> Uuid,
        text -> Text,
        timestamp -> Nullable<Timestamp>,
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
    }
}

table! {
    review_dislike_relationships (review) {
        disliker -> Uuid,
        review -> Uuid,
    }
}

table! {
    review_like_relationships (review) {
        liker -> Uuid,
        review -> Uuid,
    }
}

table! {
    reviewer_follow_relationships (follower) {
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
        timestamp -> Nullable<Timestamp>,
        text -> Varchar,
        rating -> Int4,
        tags -> Nullable<Array<Text>>,
        hotness -> Nullable<Int4>,
        images -> Nullable<Array<Text>>,
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
joinable!(comments -> reviews (review_uuid));
joinable!(comments -> users (author_uuid));
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
joinable!(reviews -> kennels (kennel_uuid));
joinable!(reviews -> users (author));

allow_tables_to_appear_in_same_query!(
    block_relationships,
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
