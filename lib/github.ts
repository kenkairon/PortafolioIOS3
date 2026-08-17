export interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  topics?: string[];
  updated_at: string;
}

/**
 * Trae los repositorios públicos (no forks) de un usuario de GitHub.
 * No requiere autenticación: la API pública permite ~60 solicitudes/hora
 * por IP sin token, suficiente para un portafolio personal.
 */
export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=15`,
    { headers: { Accept: "application/vnd.github+json" } }
  );

  if (!res.ok) {
    if (res.status === 404) throw new Error(`No existe el usuario de GitHub "${username}"`);
    if (res.status === 403) throw new Error("Límite de peticiones a la API de GitHub alcanzado, intenta más tarde");
    throw new Error(`Error de GitHub (${res.status})`);
  }

  const data = await res.json();
  return (data as any[])
    .filter((r) => !r.fork)
    .map((r) => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      language: r.language,
      stargazers_count: r.stargazers_count,
      topics: r.topics,
      updated_at: r.updated_at,
    }));
}
