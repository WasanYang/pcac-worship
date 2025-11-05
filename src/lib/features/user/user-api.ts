import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  getFirestore,
} from 'firebase/firestore';
import { getSdks } from '@/firebase';

/**
 * Represents the structure of a user document in Firestore.
 */
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any; // Firestore Timestamp
  roles?: string[];
}

/**
 * Defines the data structure for updating a user.
 * All fields are optional.
 */
export type UpdateUserPayload = Partial<Omit<User, 'uid' | 'createdAt'>>;

/**
 * API slice for user management using RTK Query.
 * It interacts with the 'users' collection in Firestore.
 */
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    /**
     * Fetches a list of all users from the 'users' collection.
     */
    getUsers: builder.query<User[], void>({
      async queryFn() {
        try {
          const { firestore } = getSdks({} as any);
          const usersCollectionRef = collection(firestore, 'users');
          const querySnapshot = await getDocs(usersCollectionRef);
          const users: User[] = [];
          querySnapshot.forEach((doc) => {
            // Type assertion to ensure the document data matches the User interface
            users.push({ uid: doc.id, ...doc.data() } as User);
          });
          return { data: users };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ uid }) => ({ type: 'User' as const, id: uid })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    /**
     * Fetches a single user's details by their UID.
     */
    getUserById: builder.query<User, string>({
      async queryFn(uid) {
        try {
          const { firestore } = getSdks({} as any);
          const userDocRef = doc(firestore, 'users', uid);
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            return { error: { status: 404, data: 'User not found' } };
          }
          return { data: { uid: docSnap.id, ...docSnap.data() } as User };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      providesTags: (result, error, uid) => [{ type: 'User', id: uid }],
    }),

    /**
     * Updates a user's document in Firestore.
     */
    updateUser: builder.mutation<
      string,
      { uid: string; payload: UpdateUserPayload }
    >({
      async queryFn({ uid, payload }) {
        try {
          const firestore = getFirestore(); // Use getSdks to access firestore instance
          const userDocRef = doc(firestore, 'users', uid);
          await updateDoc(userDocRef, payload);

          if (payload.status === 'approved') {
            const userSnap = await getDoc(userDocRef);
            const userData = userSnap.data() as User;

            const teamMemberDocRef = doc(firestore, 'team_members', uid);
            await setDoc(teamMemberDocRef, {
              id: uid,
              userId: uid,
              name:
                userData.displayName ||
                userData.email?.split('@')[0] ||
                'New Member',
              email: userData.email,
              role: ['Team Member'], // Assign a default role
              avatarUrl:
                userData.photoURL ||
                `https://picsum.photos/seed/${uid}/100/100`,
              skills: [],
              blockoutDates: [],
            });
          }

          return { data: 'success' };
        } catch (error: any) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        }
      },
      invalidatesTags: (result, error, { uid }) => [
        { type: 'User', id: uid },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery, useUpdateUserMutation } =
  userApi;
