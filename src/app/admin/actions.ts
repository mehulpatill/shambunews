"use server";

import { redirect } from "next/navigation";
import {
  createCategory,
  deleteArticle,
  deleteCategory,
  saveArticle,
  updateCategory
} from "@/lib/admin";
import { signInWithPassword, signOut } from "@/lib/auth";

export async function loginAction(email: string, password: string) {
  await signInWithPassword(email, password);
  redirect("/admin");
}

export async function signOutAction() {
  await signOut();
  redirect("/admin/login");
}

export async function saveArticleAction(input: any, id?: string | null) {
  await saveArticle(id || null, input);
  redirect("/admin/articles");
}

export async function deleteArticleAction(id: string) {
  await deleteArticle(id);
  redirect("/admin/articles");
}

export async function createCategoryAction(input: {
  name_en: string;
  name_hi: string;
  slug: string;
  sort_order?: number;
}) {
  await createCategory(input);
  redirect("/admin/categories");
}

export async function updateCategoryAction(
  id: string,
  input: { name_en: string; name_hi: string; slug: string; sort_order?: number }
) {
  await updateCategory(id, input);
  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await deleteCategory(id);
  redirect("/admin/categories");
}
