async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "エラーが発生しました。");
  }
  return data;
}

export const api = {
  me: () => request("/auth/me"),
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  saveProfile: (profile) => request("/profile", { method: "PUT", body: JSON.stringify(profile) }),
  submitQuiz: (answers) => request("/quiz", { method: "POST", body: JSON.stringify({ answers }) }),
  searchHobbies: (q) => request(`/hobbies?q=${encodeURIComponent(q ?? "")}`),
  createUserHobby: (hobbyId, characterName) =>
    request("/user-hobbies", { method: "POST", body: JSON.stringify({ hobbyId, characterName }) }),
  listUserHobbies: () => request("/user-hobbies"),
  addDiaryEntry: (userHobbyId, { content, mood, entryDate }) =>
    request(`/user-hobbies/${userHobbyId}/diary`, {
      method: "POST",
      body: JSON.stringify({ content, mood, entryDate }),
    }),
  createShareLink: (userHobbyId) => request(`/user-hobbies/${userHobbyId}/share`, { method: "POST" }),
  getSharePage: (token) => request(`/share/${token}`),
};
