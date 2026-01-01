import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 認証が必要なアクションのラッパー
 */
export async function withAuth<T>(
  action: () => Promise<T>
): Promise<ActionResult<T>> {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error('Action error:', error);
    return { success: false, error: 'An error occurred' };
  }
}

/**
 * 管理者権限が必要なアクションのラッパー
 */
export async function withAdminAuth<T>(
  action: () => Promise<T>,
  paths?: string[]
): Promise<ActionResult<T>> {
  const session = await auth();
  if (!session || session.user.role !== 'Administrator') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const data = await action();
    
    // パスの再検証
    if (paths) {
      paths.forEach(path => revalidatePath(path));
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Admin action error:', error);
    return { success: false, error: 'An error occurred' };
  }
}

/**
 * CRUDアクション用のヘルパー
 */
export const crudHelpers = {
  /**
   * 作成アクション
   */
  async create<T>(
    createFn: () => Promise<T>,
    paths: string[]
  ): Promise<ActionResult<T>> {
    return withAdminAuth(createFn, paths);
  },

  /**
   * 更新アクション
   */
  async update<T>(
    updateFn: () => Promise<T | null>,
    paths: string[],
    notFoundMessage = 'Resource not found'
  ): Promise<ActionResult<T>> {
    const session = await auth();
    if (!session || session.user.role !== 'Administrator') {
      return { success: false, error: 'Forbidden' };
    }

    try {
      const result = await updateFn();
      
      if (!result) {
        return { success: false, error: notFoundMessage };
      }

      paths.forEach(path => revalidatePath(path));
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Update error:', error);
      return { success: false, error: 'Failed to update' };
    }
  },

  /**
   * 削除アクション
   */
  async delete(
    deleteFn: () => Promise<boolean>,
    paths: string[],
    notFoundMessage = 'Resource not found or version mismatch'
  ): Promise<ActionResult<void>> {
    const session = await auth();
    if (!session || session.user.role !== 'Administrator') {
      return { success: false, error: 'Forbidden' };
    }

    try {
      const success = await deleteFn();
      
      if (!success) {
        return { success: false, error: notFoundMessage };
      }

      paths.forEach(path => revalidatePath(path));
      
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: 'Failed to delete' };
    }
  },
};

