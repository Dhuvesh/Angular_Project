import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: false,

  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
    registerForm: FormGroup;
    constructor(private formBuilder: FormBuilder) {
        this.registerForm = this.formBuilder.group({
            name: ['', [Validators.required , Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmpassword: ['', [Validators.required, Validators.minLength(6)]]
        });
    }
    registerSubmit() {
        console.log('form submitted');
    }
}
