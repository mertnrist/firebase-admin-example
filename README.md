
# Firebase Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
     match /users/{user} {
      allow read: if request.auth != null;
      allow write, create: if true;
      allow delete, update: if false;
    }
    
    function isAdmin(uid) {
      let isAdmin = exists(/databases/$(database)/documents/admins/$(uid));
      return isAdmin;
    }
 
    match /data/{document=**}  {
      allow read: if true;
      allow create, update, delete, write: if request.auth != null && isAdmin(request.auth.uid);
  }
}
}
```
