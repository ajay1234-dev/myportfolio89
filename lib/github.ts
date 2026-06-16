// Temporary workaround for local SSL certificate verification issues on Windows
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function fetchGithubRepo(owner: string, repo: string) {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = token
    ? { Authorization: `token ${token}` }
    : {};

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    const repoData = await repoRes.json();

    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
    const readmeData = await readmeRes.json();
    const readmeContent = readmeData.content
      ? Buffer.from(readmeData.content, 'base64').toString('utf-8')
      : '';

    const langsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
    const langsData = await langsRes.json();

    return {
      name: repoData.name || repo,
      description: repoData.description || '',
      url: repoData.html_url || `https://github.com/${owner}/${repo}`,
      topics: (repoData.topics as string[]) || [],
      languages: langsData ? Object.keys(langsData) : [],
      readme: readmeContent,
    };
  } catch (error) {
    console.error('Error fetching GitHub repo details:', error);
    return {
      name: repo,
      description: '',
      url: `https://github.com/${owner}/${repo}`,
      topics: [] as string[],
      languages: [] as string[],
      readme: '',
    };
  }
}

export async function fetchUserRepos() {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = token
    ? { Authorization: `token ${token}` }
    : {};

  try {
    // Paginate through all repos (100 per page)
    let allRepos: any[] = [];
    let page = 1;
    while (true) {
      const res = await fetch(
        `https://api.github.com/user/repos?sort=pushed&per_page=100&page=${page}`,
        { headers }
      );
      if (!res.ok) {
        console.error('Failed to fetch user repos:', await res.text());
        break;
      }
      const repos = await res.json();
      if (!repos.length) break;
      allRepos = allRepos.concat(repos);
      if (repos.length < 100) break; // Last page
      page++;
    }
    return allRepos;
  } catch (error) {
    console.error('Error fetching user repos:', error);
    return [];
  }
}
