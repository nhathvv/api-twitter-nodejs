# README.md

This project is an API I developed inspired by Twitter, featuring the reconstruction of various functionalities such as managing user information, tweets, media, bookmarks, likes, and followers

## Acknowledgements

- [Desgin database](https://twitter-nhathv.s3.ap-southeast-1.amazonaws.com/images/design-db.jpg)
- [Swagger API Docs](https://nhat-dev-twitter.onrender.com/api-docs/)

## Installation

Install my-project with npm:

```bash
  npm install
  npm run dev
```

Then, navigate to http://localhost:4000 in your browser to view the project.

## API Reference

### User

#### Login

```
  POST /users/login
```

| Body       | Type     | Description                         |
| :--------- | :------- | :---------------------------------- |
| `email`    | `string` | **Required**. User's email address. |
| `password` | `string` | **Required**. User's password.      |

#### Register

```
  POST /users/register
```

| Body               | Type     | Description                              |
| :----------------- | :------- | :--------------------------------------- |
| `name`             | `string` | **Required**. User's full name.          |
| `email`            | `string` | **Required**. User's email address.      |
| `password`         | `string` | **Required**. User's password.           |
| `confirm_password` | `string` | **Required**. Confirm user's password.   |
| `date_of_birth`    | `string` | User's date of birth in ISO 8601 format. |

#### Get User Profile (Me)

```
  GET /users/me
```

| Authorization  | Type     | Description                      |
| :------------- | :------- | :------------------------------- |
| `access_token` | `string` | **Required**. The accesss token. |

#### Update User Profile

```
  PATCH /users/me
```

| Authorization  | Type     | Description                      |
| :------------- | :------- | :------------------------------- |
| `access_token` | `string` | **Required**. The accesss token. |

#### Logout

```
  POST /users/logout
```

| Body            | Type     | Description                      |
| :-------------- | :------- | :------------------------------- |
| `refresh_token` | `string` | **Required**. The refresh token. |

#### Get access token

```
  POST /users/refresh-token
```

| Body            | Type     | Description                      |
| :-------------- | :------- | :------------------------------- |
| `refresh_token` | `string` | **Required**. The refresh token. |

#### Resend verify email

```
  POST /users/resend-verify-email
```

| Authorization  | Type     | Description                      |
| :------------- | :------- | :------------------------------- |
| `access_token` | `string` | **Required**. The accesss token. |

#### Forgot password

```
  POST /users/forgot-password
```

| Body    | Type     | Description                         |
| :------ | :------- | :---------------------------------- |
| `email` | `string` | **Required**. User's email address. |

#### Verify forgot password

```
  POST /users/verify-forgot-password
```

| Body                    | Type     | Description                              |
| :---------------------- | :------- | :--------------------------------------- |
| `forgot_password_token` | `string` | **Required**. The forgot password token. |

#### Reset password

```
  POST /users/forgot-password
```

| Body                    | Type     | Description                            |
| :---------------------- | :------- | :------------------------------------- |
| `forgot_password_token` | `string` | **Required**. The forgot password      |
| `password`              | `string` | **Required**. User's password.         |
| `confirm_password`      | `string` | **Required**. Confirm user's password. |

#### Get username

```
  GET /users/{username}
```

| Parameters | Type     | Description                                                         |
| :--------- | :------- | :------------------------------------------------------------------ |
| `username` | `string` | **Required**. The username of the user to retrieve information for. |

#### Follow users

```
  POST /users/follow
```

| Body               | Type     | Description                                  |
| :----------------- | :------- | :------------------------------------------- |
| `followed_user_id` | `string` | **Required**. TThe ID of the user to follow. |

#### Unfollow users

```
  DELETE /users/{user_id}
```

| Parameters | Type     | Description                                    |
| :--------- | :------- | :--------------------------------------------- |
| `user_id`  | `string` | **Required**. TThe ID of the user to unfollow. |

#### Change password

```
  PUT /users/change-password
```

| Parameters         | Type     | Description                             |
| :----------------- | :------- | :-------------------------------------- |
| `old_password`     | `string` | **Required**. The current password.     |
| `password`         | `string` | **Required**. The new password.         |
| `confirm_password` | `string` | **Required**. Confirm the new password. |

### Tweets

#### Create Tweet

```
  POST /tweets
```

| Body        | Type     | Description                                   |
| :---------- | :------- | :-------------------------------------------- |
| `type`      | `number	` | **Required**. The type of the tweet.          |
| `audience`  | `number` | **Required**. The audience of the tweet.      |
| `content`   | `string` | **Required**. The content of the tweet.       |
| `parent_id` | `string` | The ID of the parent tweet (if applicable).   |
| `hashtags`  | `array`  | An array of hashtags included in the tweet.   |
| `mentions`  | `array`  | An array of user IDs mentioned in the tweet.  |
| `medias`    | `array`  | An array of media URLs attached to the tweet. |

#### Get Tweets

```
  GET /tweets
```

| Parameters | Type     | Description                                     |
| :--------- | :------- | :---------------------------------------------- |
| `limit`    | `number	` | **Required**. The number of tweets to retrieve. |
| `page`     | `number` | **Required**. The page number of the results.   |

#### Get Tweets by ID

```
  GET /tweets/{tweet_id}
```

| Parameters | Type     | Description                                     |
| :--------- | :------- | :---------------------------------------------- |
| `limit`    | `number	` | **Required**. The number of tweets to retrieve. |
| `page`     | `number` | **Required**. The page number of the results.   |
| `tweet_id` | `number	` | **Required**. The ID of the tweet to retrieve.  |

#### Get Tweets Children by Tweet ID

```
  GET /tweets/{tweet_id}/children
```

| Parameters   | Type     | Description                                                            |
| :----------- | :------- | :--------------------------------------------------------------------- |
| `limit`      | `number	` | **Required**. The number of tweets to retrieve.                        |
| `page`       | `number` | **Required**. The page number of the results.                          |
| `tweet_id`   | `number	` | **Required**. The ID of the tweet to retrieve.                         |
| `tweet_type` | `number` | **Required**. Type of the tweet (Tweet, Retweet, QuoteTweet, Comment). |

### Medias

#### Upload Image

```
  POST /medias/upload-image
```

| Body    | Type   | Description                             |
| :------ | :----- | :-------------------------------------- |
| `image` | `file	` | **Required**. The image file to upload. |

#### Upload Video

```
  POST /medias/upload-video
```

| Body    | Type   | Description                             |
| :------ | :----- | :-------------------------------------- |
| `video` | `file	` | **Required**. The video file to upload. |

### Static

#### Stream video

```
  GET /statics/video-stream/{video_name}
```

| Parameters   | Type     | Description                                    |
| :----------- | :------- | :--------------------------------------------- |
| `video_name` | `string	` | **Required**. The name of the video to stream. |

#### Stream video HLS

```
  GET /statics/video-hls/{id}/master.m3u8
```

| Parameters | Type     | Description                |
| :--------- | :------- | :------------------------- |
| `id`       | `string	` | **Required**. The video ID |

#### Stream video HLS segment

```
  GET /statics/video-hls/{id}/{v}/{segment}
```

| Parameters | Type     | Description                      |
| :--------- | :------- | :------------------------------- |
| `id`       | `string	` | **Required**. The video ID       |
| `v`        | `string	` | **Required**. The video version. |
| `segment`  | `string	` | **Required**. The video segment. |

### Search

#### Search Tweet

```
  GET /search
```

| Parameters | Type     | Description                                     |
| :--------- | :------- | :---------------------------------------------- |
| `keyword`  | `string	` | **Required**. The keyword to search for.        |
| `limit`    | `number	` | **Required**. The number of tweets to retrieve. |
| `page`     | `number` | **Required**. The page number of the results.   |

### Likes

#### Like tweet

```
  POST /likes
```

| Body       | Type     | Description                                |
| :--------- | :------- | :----------------------------------------- |
| `tweet_id` | `string	` | **Required**. The ID of the tweet to like. |

#### Unlike tweet

```
  DELETE /likes/tweets/{tweet_id}
```

| Parameters | Type     | Description                                  |
| :--------- | :------- | :------------------------------------------- |
| `tweet_id` | `string	` | **Required**. The ID of the tweet to unlike. |

### Bookmarks

#### Bookmark tweet

```
  POST /bookmarks
```

| Body       | Type     | Description                                    |
| :--------- | :------- | :--------------------------------------------- |
| `tweet_id` | `string	` | **Required**. The ID of the tweet to bookmark. |

#### Unbookmark tweet

```
  DELETE /bookmarks/tweets/{tweet_id}
```

| Parameters | Type     | Description                                      |
| :--------- | :------- | :----------------------------------------------- |
| `tweet_id` | `string	` | **Required**. The ID of the tweet to unbookmark. |

### Conversations

#### Get conversations by receiver ID

```
  GET /conversations/receiver/{receiver_id}
```

| Parameters    | Type     | Description                                               |
| :------------ | :------- | :-------------------------------------------------------- |
| `receiver_id` | `string	` | **Required**. The ID of the receiver in the conversation. |

## Environment Variables

To run this project, you will need to add the following environment variables to your **.env.example** file

## Authors

- [@nhathvv](https://www.github.com/nhathvv)

## 🔗 Links

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hoang-van-nhat/)
[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/Nhathvvv)
