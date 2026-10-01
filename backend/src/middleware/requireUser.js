import { getAuth } from "@clerk/express";

// Rejects requests without a valid Clerk session token and exposes the
// verified user ID as req.userId. Any :userId in the URL must match it.
const requireUser = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.userId = userId;
  next();
};

export const matchUserParam = (req, res, next) => {
  if (req.params.userId !== req.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export default requireUser;
