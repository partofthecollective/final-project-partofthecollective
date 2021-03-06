/**
 * async method callMethodEnroll
 * @param postIt
 * @param firstName
 * @param lastName
 * @param email
 * @param accountAddress
 * @returns {Promise.<*>}
 */
export const callMethodEnroll = async (postIt, firstName, lastName, email, accountAddress) => {
  try {
    const tx = await postIt.enroll(firstName, lastName, email, { from: accountAddress });
    return tx;
  } catch(e) {
    //console.log(e);
    return { success: false, message: 'Error: There was a problem with your registration.' };
  }
};

/**
 * async method callMethodIsEnrolled
 * @param postIt
 * @param email
 * @param accountAddress
 * @returns {Promise.<*>}
 */
export const callMethodIsEnrolled = async (postIt, email, accountAddress) => {
  try {
    const isEnrolled = await postIt.enrolled(accountAddress, { from: accountAddress });
    const userProfile = await postIt.getUserProfile({from: accountAddress});

    if (isEnrolled && userProfile && userProfile[2] === email) {
      return { success: true, message: 'You are successfuly logged in.', userProfile: userProfile };
    } else {
      throw new Error('No user profile found with those credentials.');
    }
  } catch(e) {
    //console.log(e);
    return { success: false, message: e };
  }
};

/**
 * async method callMethodGetAllPosts
 * @param postIt
 * @param accountAddress
 * @returns {Promise.<*>}
 */
export const callMethodGetAllPosts = async (postIt, accountAddress) => {
  if (!postIt) {
    return;
  }
  let postData = [];
  try {
    const posts = await postIt.getAllPosts({from: accountAddress});
    if (posts.length > 0) {
      let postsCall = posts.map((postId) => { return callMethodGetPost(postIt, postId); });
      await Promise.all(postsCall)
        .then((postResults) => {
          postResults.map((postResult) => {
            return postData.push({
              postId: postResult[0].toNumber(),
              title: postResult[1],
              content: postResult[2],
              votes: postResult[3].toNumber(),
              author: postResult[4],
              accountAddress: postResult[5],
            });
          });
        });
    }
    return postData.filter((data) => data.title !== '');
  } catch(e) {
    //console.log(e);
    return { success: false, message: e };
  }
};

/**
 * async method callMethodAddPost
 * @param postIt
 * @param postTitle
 * @param postContent
 * @param accountAddress
 * @returns {Promise.<*>}
 */
export const callMethodAddPost = async (postIt, postTitle, postContent, accountAddress) => {
  try {
    const tx = await postIt.addPostIt(postTitle, postContent, 0, { from: accountAddress });
    return { success: true, post: { title: postTitle, content: postContent }, tx: tx };
  } catch(e) {
    //console.log(e);
    return { success: false, message: e };
  }
};

/**
 * async method callMethodGetPost
 * @param postIt
 * @param postId
 * @returns {Promise.<*>}
 */
export const callMethodGetPost = async (postIt, postId) => {
  try {
    const post = await postIt.getPost(postId);
    return post;
  } catch(e) {
    //console.log(e);
    return { success: false, message: e };
  }
};

/**
 * async method callMethodGetUserProfile
 * @param postIt
 * @param accountAddress
 * @returns {Promise.<*>}
 */
export const callMethodGetUserProfile = async (postIt, accountAddress) => {
  try {
    const userProfile = await postIt.getUserProfile({ from: accountAddress });
    return { firstName: userProfile[0], lastName: userProfile[1], email: userProfile[2] };
  } catch(e) {
    //console.log(e);
    return { success: false, message: e };
  }
};

/**
 * async method callMethodMakeUpVote
 * @param postIt
 * @param postId
 * @param accountAddress
 * @returns {Promise.<*>}
 */
export const callMethodMakeUpVote = async (postIt, postId, accountAddress) => {
  try {
    const tx = await postIt.makeUpVote(postId, { from: accountAddress });
    return { success: true, tx: tx, message: `You have successfully casted an up voted for postId: ${postId}.` };
  } catch(e) {
    //console.log(e);
    return { success: false, message: e };
  }
};

/**
 * async method callMethodMakeDownVote
 * @param postIt
 * @param postId
 * @param accountAddress
 * @returns {Promise.<*>}
 */
export const callMethodMakeDownVote = async (postIt, postId, accountAddress) => {
  try {
    const tx = await postIt.makeDownVote(postId, { from: accountAddress });
    return { success: true, tx: tx, message: `You have successfully casted an down voted for postId: ${postId}.` };
  } catch(e) {
    //console.log(e);
    return { success: false, message: e };
  }
};

/**
 * async method callEventsByName
 * @param postIt
 * @param name
 * @param passedFilter
 * @returns {Promise}
 */
export const callEventsByName = async (postIt, name, passedFilter) => {
  if (!postIt) {
    return;
  }
  const filter = passedFilter || {};
  let data = [];
  let loggedEvent;
  switch (name) {
    case 'posts':
      loggedEvent = postIt.LogNewPostAdded(filter, { fromBlock: 0, toBlock: 'latest' });
      break;

    case 'comments':
      loggedEvent = postIt.LogComment(filter, { fromBlock: 0, toBlock: 'latest' });
      break;

    default:
      loggedEvent = postIt.allEvents(filter, { fromBlock: 0, toBlock: 'latest' });
      break;
  }

  return new Promise((resolve, reject) => {
    loggedEvent.get((error, logs) => {
      if (error) {
        reject(error);
      }
      logs.map((log) => data.push(log.args));
      //console.log(data);
      resolve(data);
    });
  });
};

/**
 * async method callPostComment
 * @param postIt
 * @param postId
 * @param commentBody
 * @param accountAddress
 * @returns {Promise.<*>}
 */
export const callPostComment = async (postIt, postId, commentBody, accountAddress) => {
  try {
    const tx = await postIt.addComment(postId, commentBody, { from: accountAddress });
    return { success: true, tx: tx, message: `You have successfully posted a comment for postId: ${postId}.` };
  } catch(e) {
    //console.log(e);
    return { success: false, message: e };
  }
};
