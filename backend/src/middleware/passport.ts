import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../entities/Users";
import { Profile } from "../entities/Profiles";
import { appDataSource } from "../config/db";
import { Role } from "../entities/Roles";
import { UserHasRole } from "../entities/UserHasRoles";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        const userRepository = appDataSource.getRepository(User);
        const profileRepository = appDataSource.getRepository(Profile);
        const roleRepository = appDataSource.getRepository(Role);
        const userHasRoleRepository = appDataSource.getRepository(UserHasRole);

        // Check if user already exists with the email
        let user = await userRepository.findOne({
          where: { email: profile.emails[0].value },
          relations: ["profile"],
        });

        if (user) {
          // User exists, check if google_id is already set
          if (!user.google_id) {
            // Update user to associate Google account
            user.google_id = profile.id;
            await userRepository.save(user);
          }
          return done(null, user);
        } else {
          // If user does not exist, create a new user
          user = new User();
          user.google_id = profile.id;
          user.username = profile.displayName;
          user.email = profile.emails[0].value;
          user.password = ""; // Google login doesn't use a password
          user.active = true;

          // Create and associate a profile for the user
          const userProfile = new Profile();
          userProfile.first_name = profile.name?.givenName || "";
          userProfile.last_name = profile.name?.familyName || "";
          userProfile.image = profile.photos[0].value;
          user.profile = userProfile;

          // Save the new user and profile to the database
          await appDataSource.manager.save(user);

          // Fetch the default role for new users, e.g., "buyer"
          const defaultRole = await roleRepository.findOne({
            where: { name: "buyer" },
          });

          if (!defaultRole) {
            return done(new Error("Default role not found"), null);
          }

          // Associate the user with the default role
          const userHasRole = new UserHasRole();
          userHasRole.user = user;
          userHasRole.role = defaultRole;
          await appDataSource.manager.save(userHasRole);

          done(null, user);
        }
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const userRepository = appDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["profile"],
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
