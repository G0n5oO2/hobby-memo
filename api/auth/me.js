import { getSessionUser } from "../_lib/session.js";
import { prisma } from "../_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const user = await getSessionUser(req);
  if (!user) {
    res.status(200).json({ user: null });
    return;
  }

  const userHobbies = await prisma.userHobby.findMany({
    where: { userId: user.id },
    select: { id: true },
  });

  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      gender: user.gender,
      age: user.age,
      interests: user.interests,
      onboardingStep: user.onboardingStep,
      extendedQuiz: user.extendedQuiz,
      hasHobby: userHobbies.length > 0,
    },
  });
}
