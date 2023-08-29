

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Auth } from '@aws-amplify/auth';
import { fail } from 'assert';


export async function authorize(username: string, password: string, userPoolId: any,clientId:any): Promise<string> {

	Auth.configure({
		aws_user_pools_id: userPoolId,
		aws_user_pools_web_client_id: clientId,
		authenticationFlowType: 'USER_SRP_AUTH',
	});

	try {
		let loginFlowFinished = false;
		while (!loginFlowFinished) {
			const user = await Auth.signIn(username, password);
			if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
			fail("new password required");
			}
			if (user?.authenticationFlowType === 'USER_SRP_AUTH') {
				const idToken = user.signInUserSession.idToken.jwtToken;
				loginFlowFinished = true;
				return idToken;
			}
		}
	} catch (err: any) {
		console.log(`authorizeUser: err: ${err}`);
		fail("error")
		return err.name;
	}

	return '';
}



