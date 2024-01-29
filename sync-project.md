### How to make your own project in sync with the original pilot project

Once you've cloned the pilot project, and put it into your own github account, you'll want to keep it in sync with the
original pilot project. This is a good idea because the original pilot project will be updated with new features and bug
fixes.
Here is the manual way to do it with rsync:

1. Clone the original pilot project into a directory called `pilot`:

   ```bash
   git clone git@github.com:Weaverse/pilot.git
   ```

2. Put your own pilot project into a same level directory.

3. Run the following command to sync your project with the original pilot project, Keep in mind to
   replace `your-pilot-project` with the name of your own pilot project.

   ```bash
   rsync -arv --exclude=node_modules --exclude=.git --exclude=.cache --exclude=.turbo --exclude=dist --exclude=.env ./pilot/ ./your-pilot-project
   ```

4. Commit and push your changes to your own pilot project.
5. It is recommended to run the sync command every time you want to update your project with the latest changes from the
   original pilot project.
