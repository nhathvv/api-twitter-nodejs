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
