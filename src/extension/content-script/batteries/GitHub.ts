import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/github.com\/([^/]+)(\/([^/]+))?$/;

const battery = async (): Promise<void> => {
  const urlParts = document.location.pathname.split("/");
  const username = urlParts[1];
  const repo = urlParts[2];

  let found = false;

  if (username && repo) {
    found = await handleRepositoryPage(username, repo);
  }

  if (!found && username) {
    await handleProfilePage(username);
  }
};

function parseText(text: string) {
  const match = text.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i);
  if (match) return match[2];
}

async function handleProfilePage(username: string): Promise<boolean> {
  const userProfile = await fetch(
    // fetch user data
    `https://api.github.com/users/${username}`
  ).then((res) => res.json());

  if (!userProfile || !userProfile.login) return false; // not an user profile

  let address = null;

  if (userProfile.bio) {
    // load from bio
    address = parseText(userProfile.bio);
  }

  if (!address) {
    // load from profile's readme
    const userRepoReadmeData = await fetch(
      `https://api.github.com/repos/${username}/${username}/readme`
    ).then((res) => res.json());

    if (userRepoReadmeData.download_url) {
      const userRepoReadmeContent = await fetch(
        userRepoReadmeData.download_url
      ).then((res) => res.text());
      address = parseText(userRepoReadmeContent);
    }
  }

  if (!address) return false; // address was not found

  setLightningData([
    {
      method: "lnurl",
      recipient: address,
      ...getOriginData(),
      description: userProfile.bio ?? "",
      name: userProfile.name,
      icon: userProfile.avatar_url ?? "",
    },
  ]);

  return true;
}

async function handleRepositoryPage(
  owner: string,
  repo: string
): Promise<boolean> {
  const repoData = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`
  ).then((res) => res.json());

  if (!repoData || !repoData.id) return false; // not a repo

  let address = null;

  if (repoData.description) {
    address = parseText(repoData.description);
  }

  if (!address) {
    const repoReadmeData = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`
    ).then((res) => res.json());

    if (repoReadmeData.download_url) {
      const repoReadmeDataContent = await fetch(
        repoReadmeData.download_url
      ).then((res) => res.text());
      address = parseText(repoReadmeDataContent);
    }
  }

  if (!address) return false; // address was not found

  setLightningData([
    {
      method: "lnurl",
      recipient: address,
      ...getOriginData(),
      description: repoData.description,
      name: repoData.full_name,
      icon: "",
    },
  ]);

  return true;
}

const GitHubProfile = {
  urlMatcher,
  battery,
};

export default GitHubProfile;
