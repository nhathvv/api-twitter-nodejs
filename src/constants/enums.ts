export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}
export enum TokenTypes {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  VerifyEmailToken
}
export enum MediaTypes {
  Image,
  Video,
  HLS
}
export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}
export enum EncodingStatus {
  Pending,
  Processing,
  Success,
  Failed
}
export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}
export enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}
export enum PeopleFollow {
  Everyone = '0',
  PeopleFollow = '1'
}
