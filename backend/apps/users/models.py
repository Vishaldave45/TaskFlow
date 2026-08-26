from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.users.managers import UserManager


# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True, error_messages={"unique": "A user with that email already exists."})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
     # Set email as the primary login identifier
    USERNAME_FIELD="email"
    REQUIRED_FIELDS = ["username"]
    
    
    objects = UserManager()

    class Meta:
        pass
    
    
    def __str__(self):
        return self.email