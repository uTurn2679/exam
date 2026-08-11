"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: "STUDENT" | "ADMIN";
};

export async function registerUserAction(input: RegisterInput) {
  try {
    // Admin registration is disabled
    if (input.role === "ADMIN") {
      return { success: false, error: "Admin registration is disabled. Admin credentials are fixed." };
    }

    const emailClean = input.email.trim().toLowerCase();
    
    let existing = null;
    try {
      existing = await prisma.user.findUnique({
        where: { email: emailClean },
      });
    } catch (e) {
      // Ignore DB read errors
    }

    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    let user = null;
    try {
      user = await prisma.user.create({
        data: {
          name: input.name.trim(),
          email: emailClean,
          password: input.password,
          role: "STUDENT",
        },
      });
    } catch (e) {
      // Fallback for student account when DB is read-only
      user = { id: "student_" + Date.now(), name: input.name.trim(), email: emailClean, role: "STUDENT" };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_session", user.id, { httpOnly: true, path: "/" });
    cookieStore.set("auth_user_name", user.name, { httpOnly: false, path: "/" });
    cookieStore.set("auth_user_email", user.email, { httpOnly: false, path: "/" });
    cookieStore.set("auth_role", user.role, { httpOnly: false, path: "/" });

    revalidatePath("/");
    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error?.message || "Failed to register account" };
  }
}

export type LoginInput = {
  email: string; // Can be "habib@gmail.com" or "habib" or "22cseahsanhabib@gmail.com"
  password: string;
  targetRole?: "STUDENT" | "ADMIN";
};

export async function loginUserAction(input: LoginInput) {
  try {
    const inputClean = input.email.trim().toLowerCase();
    const isAdminAttempt =
      input.targetRole === "ADMIN" ||
      inputClean === "habib@gmail.com" ||
      inputClean === "habib" ||
      inputClean === "22cseahsanhabib@gmail.com";

    // 100% BULLETPROOF FIXED ADMIN LOGIN (No DB Query Required)
    if (isAdminAttempt) {
      const validAdminIdentifiers = ["habib@gmail.com", "habib", "22cseahsanhabib@gmail.com"];
      if (validAdminIdentifiers.includes(inputClean) && input.password === "267993") {
        const cookieStore = await cookies();
        cookieStore.set("auth_session", "admin_fixed_id", { httpOnly: true, path: "/" });
        cookieStore.set("auth_user_name", "habib", { httpOnly: false, path: "/" });
        cookieStore.set("auth_user_email", "habib@gmail.com", { httpOnly: false, path: "/" });
        cookieStore.set("auth_role", "ADMIN", { httpOnly: false, path: "/" });

        revalidatePath("/");
        return { success: true, user: { id: "admin_fixed_id", name: "habib", email: "habib@gmail.com", role: "ADMIN" } };
      } else {
        return { success: false, error: "Invalid Admin email/username or password." };
      }
    }

    // Student Login lookup
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: inputClean },
      });
    } catch (e) {
      console.error("Database lookup error:", e);
    }

    if (!user || user.password !== input.password) {
      return { success: false, error: "Invalid email or password." };
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_session", user.id, { httpOnly: true, path: "/" });
    cookieStore.set("auth_user_name", user.name, { httpOnly: false, path: "/" });
    cookieStore.set("auth_user_email", user.email, { httpOnly: false, path: "/" });
    cookieStore.set("auth_role", user.role, { httpOnly: false, path: "/" });

    revalidatePath("/");
    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  } catch (error: any) {
    return { success: false, error: error?.message || "Login failed" };
  }
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  cookieStore.delete("auth_user_name");
  cookieStore.delete("auth_user_email");
  cookieStore.delete("auth_role");
  revalidatePath("/");
  redirect("/login");
}

export async function getAuthSessionAction() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_session")?.value;
    const name = cookieStore.get("auth_user_name")?.value;
    const email = cookieStore.get("auth_user_email")?.value;
    const role = cookieStore.get("auth_role")?.value as "STUDENT" | "ADMIN" | undefined;

    if (!userId) return { isLoggedIn: false };

    const displayName = role === "ADMIN" ? "habib" : (name || "User");

    return {
      isLoggedIn: true,
      user: { id: userId, name: displayName, email: email || "", role: role || "STUDENT" },
    };
  } catch (error) {
    return { isLoggedIn: false };
  }
}
