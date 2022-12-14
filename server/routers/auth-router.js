import { Router } from 'express';
import is from '@sindresorhus/is';
import { userService } from '../services/index.js';
import { adminOnly, loginRequired } from '../middlewares/index.js';
import { rentalRouter } from './rental-router.js';

/**
 * @swagger
 * tags:
 *   name: auth
 *   description: 로그인,회원가입 API
 */

const authRouter = Router();
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 유저정보가 새로 생성됩니다.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 이름
 *               email:
 *                 type: string
 *                 description: 이메일
 *               password:
 *                 type: string
 *                 description: 비밀번호
 *               phoneNumber:
 *                 type: string
 *                 description: 전화번호
 *     responses:
 *       200:
 *         description: 유저정보가 등록되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/users'
 */
authRouter.post('/signup', async (req, res, next) => {
  try {
    // Content-Type: application/json 설정을 안 한 경우, 에러를 만들도록 함.
    // application/json 설정을 프론트에서 안 하면, body가 비어 있게 됨.
    if (is.emptyObject(req.body)) {
      throw new Error(
        'headers의 Content-Type을 application/json으로 설정해주세요',
      );
    }

    // req (request)의 body 에서 데이터 가져오기
    const { name, email, password, phoneNumber } = req.body;

    // 위 데이터를 유저 db에 추가하기
    const newUser = await userService.addUser({
      name,
      email,
      password,
      phoneNumber,
    });
    // 추가된 유저의 db 데이터를 프론트에 다시 보내줌
    // 물론 프론트에서 안 쓸 수도 있지만, 편의상 일단 보내 줌
    res.send(newUser);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: 유저가 로그인 합니다.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 이메일
 *               password:
 *                 type: string
 *                 description: 비밀번호
 *     responses:
 *       200:
 *         description: 유저의 토큰과 어드민 정보가 반환됩니다..
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: jwt 토큰
 *                 isAdmin:
 *                   type: boolean
 *                   description: 어드민인지 확인 어드민일 경우 true
 */

authRouter.post('/signin', async (req, res, next) => {
  try {
    // application/json 설정을 프론트에서 안 하면, body가 비어 있게 됨.
    if (is.emptyObject(req.body)) {
      throw new Error(
        'headers의 Content-Type을 application/json으로 설정해주세요',
      );
    }

    // req (request) 에서 데이터 가져오기
    const { email, password } = req.body;

    // 로그인 진행 passport하기-작성
    const loginResult = await userService.getUserToken({
      email,
      password,
    });
    res.status(200).json(loginResult);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/signup/kakao:
 *   post:
 *     summary: 카카오 유저 정보가 새로 생성됩니다.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 이메일
 *     responses:
 *       200:
 *         description: 유저정보가 등록되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/users'
 */
authRouter.post('/signup/kakao', async (req, res, next) => {
  try {
    const { authorizationCode } = req.body;
    const token = await userService.addUserWithKakao(authorizationCode);
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/signin/kakao:
 *   post:
 *     summary: 카카오 유저 정보가 새로 생성됩니다.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: 이메일
 *     responses:
 *       200:
 *         description: 카카오 유저가 로그인됩니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: jwt 토큰
 *                 isAdmin:
 *                   type: boolean
 *                   description: 어드민인지 확인 어드민일 경우 true
 */
authRouter.post('/signin/kakao', async function (req, res, next) {
  try {
    const email = req.body.email;

    const loginResult = await userService.getUserTokenWithKakao(email);

    res.status(200).json(loginResult);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/check-pwd:
 *   post:
 *     summary: 패스워드를 확인합니다.
 *     tags: [auth]
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: 패스워드
 *     responses:
 *       200:
 *         description: 성공여부.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description:  결과값

 */
authRouter.post('/check-pwd', loginRequired, async function (req, res, next) {
  try {
    const userId = req.currentUserId;
    const { password } = req.body;

    const result = await userService.checkUserPassword(userId, password);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/change-pwd:
 *   post:
 *     summary: 패스워드를 새로운 패스워드로 바꿉니다.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: userId 값
 *               password:
 *                 type: string
 *                 description: 패스워드
 *     responses:
 *       200:
 *         description: 성공여부.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description:  성공여부
 *                 message:
 *                   type: string
 *                   description:  메시지

 */
authRouter.post('/change-pwd', async function (req, res, next) {
  try {
    const { password, userId } = req.body;
    const toUpdate = {
      ...(password && { password }),
    };

    const user = await userService.changeUserPassword(userId, toUpdate);
    if (!user) {
      throw new Error('비밀번호 변경이 안되었습니다. 다시 확인해 주세요');
    }

    res.status(200).json({
      result: 'success',
      message: '다시 회원가입해주세요.',
    });
  } catch (error) {
    next(error);
  }
});

export { authRouter };
