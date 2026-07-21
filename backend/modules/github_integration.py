import httpx
import os
import base64

class GitHubIntegration:
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.repo = os.getenv("GITHUB_REPO", "hub3pixellab/hub3jarvis")
        self.api = "https://api.github.com"
        self.headers = {"Authorization": f"token {self.token}", "Accept": "application/vnd.github.v3+json"}

    async def create_or_update_file(self, path, content, message, branch="main"):
        url = f"{self.api}/repos/{self.repo}/contents/{path}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers, params={"ref": branch})
            sha = resp.json().get("sha") if resp.status_code == 200 else None
            encoded = base64.b64encode(content.encode()).decode()
            body = {"message": message, "content": encoded, "branch": branch}
            if sha: body["sha"] = sha
            resp = await client.put(url, headers=self.headers, json=body)
            return resp.json()

    async def create_branch(self, branch_name, from_branch="main"):
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.api}/repos/{self.repo}/git/refs/heads/{from_branch}", headers=self.headers)
            sha = resp.json()["object"]["sha"]
            resp = await client.post(f"{self.api}/repos/{self.repo}/git/refs", headers=self.headers, json={"ref": f"refs/heads/{branch_name}", "sha": sha})
            return resp.json()

    async def create_pull_request(self, title, head, base="main", body=""):
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.api}/repos/{self.repo}/pulls", headers=self.headers, json={"title": title, "head": head, "base": base, "body": body})
            return resp.json()

    async def create_issue(self, title, body, labels=None):
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.api}/repos/{self.repo}/issues", headers=self.headers, json={"title": title, "body": body, "labels": labels or []})
            return resp.json()

    async def create_release(self, tag, name, body, draft=False):
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.api}/repos/{self.repo}/releases", headers=self.headers, json={"tag_name": tag, "name": name, "body": body, "draft": draft})
            return resp.json()

    async def list_releases(self):
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.api}/repos/{self.repo}/releases", headers=self.headers)
            return resp.json()

    async def get_repo_info(self):
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.api}/repos/{self.repo}", headers=self.headers)
            return resp.json()

    async def list_commits(self, per_page=10):
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.api}/repos/{self.repo}/commits", headers=self.headers, params={"per_page": per_page})
            return resp.json()

github_integration = GitHubIntegration()
