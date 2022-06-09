import { Battery } from "~/types";

import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/github.com\/([^/]+)(\/([^/]+))?$/;

const battery = async (): Promise<void> => {
  const urlParts = document.location.pathname.split("/");
  const username = urlParts[1];
  const repo = urlParts[2];

  let lightningData = null;

  // Search lightning data in the repository if the current page is a repository page
  if (username && repo) {
    lightningData = await getLightningDataFromRepository(username, repo);
  }

  // Search lightning data in the user profile if the current page is a profile page
  // or if the current page is a repository page but the lightning data is not set at repository level
  if (!lightningData && username) {
    lightningData = await getLightningDataFromProfile(username);
  }

  if (lightningData) setLightningData([lightningData]);
};

function findLightningAddressInText(text: string) {
  const match = text.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i);
  if (match) return match[2];
}

async function getLightningDataFromProfile(
  username: string
): Promise<Battery | null> {
  const userProfile = await fetch(
    // fetch user data
    `https://api.github.com/users/${username}`
  ).then((res) => res.json());

  if (!userProfile || !userProfile.login) return null; // not an user profile

  let address = null;

  if (userProfile.bio) {
    // search in bio
    address = findLightningAddressInText(userProfile.bio);
  }

  if (!address) {
    // search in profile's readme
    const userRepoReadmeData = await fetch(
      `https://api.github.com/repos/${username}/${username}/readme`
    ).then((res) => res.json());

    if (userRepoReadmeData.download_url) {
      const userRepoReadmeContent = await fetch(
        userRepoReadmeData.download_url
      ).then((res) => res.text());
      address = findLightningAddressInText(userRepoReadmeContent);
    }
  }

  if (!address) return null; // address was not found

  return {
    method: "lnurl",
    recipient: address,
    ...getOriginData(),
    description: userProfile.bio ?? "",
    name: userProfile.name,
    icon: userProfile.avatar_url ?? "",
  };
}

async function getLightningDataFromRepository(
  owner: string,
  repo: string
): Promise<Battery | null> {
  const repoData = await fetch(
    // fetch repo data
    `https://api.github.com/repos/${owner}/${repo}`
  ).then((res) => res.json());

  if (!repoData || !repoData.id) return null; // not a repo

  let address = null;

  if (repoData.description) {
    // search in description
    address = findLightningAddressInText(repoData.description);
  }

  if (!address) {
    // searcg in readme
    const repoReadmeData = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`
    ).then((res) => res.json());

    if (repoReadmeData.download_url) {
      const repoReadmeDataContent = await fetch(
        repoReadmeData.download_url
      ).then((res) => res.text());
      address = findLightningAddressInText(repoReadmeDataContent);
    }
  }

  if (!address) return null; // address was not found

  return {
    method: "lnurl",
    recipient: address,
    ...getOriginData(),
    description: repoData.description,
    name: repoData.full_name,
    icon: "",
  };
}

const GitHubProfile = {
  urlMatcher,
  battery,
};

export default GitHubProfile;
