
import { GitHubConfig } from "../types";

export const verifyConnection = async (config: GitHubConfig): Promise<boolean> => {
  try {
    const response = await fetch(`https://api.github.com/repos/${config.username}/${config.repo}`, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (response.status === 200) {
        const data = await response.json();
        return !data.archived; 
    }
    return false;
  } catch (error) {
    console.error("GitHub Connection Verification Failed", error);
    return false;
  }
};

export const uploadImageToGitHub = async (
  base64Image: string,
  filename: string,
  config: GitHubConfig
): Promise<string> => {
  // GitHub API requires content without the data URI prefix
  const content = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const path = `pins/${filename}`; // Save in a 'pins' folder to keep repo clean
  const url = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${path}`;
  
  // STEP 1: Check if file exists to get SHA (Required for updates)
  let sha: string | undefined;
  try {
    const getResponse = await fetch(url, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }
  } catch (e) {
    // If 404 or network error, we assume it's a new file or will fail gracefully on PUT
    console.warn("Could not check for existing file, proceeding as new", e);
  }

  // STEP 2: Prepare Upload Body
  const body: any = {
    message: `Add/Update pin for ${filename}`,
    content: content,
    branch: 'main' 
  };

  // If updating, we MUST provide the sha
  if (sha) {
    body.sha = sha;
  }

  // STEP 3: Perform Upload (PUT)
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GitHub Upload Failed: ${errorData.message}`);
  }

  // Return the raw download URL which is public
  return `https://raw.githubusercontent.com/${config.username}/${config.repo}/main/${path}`;
};
