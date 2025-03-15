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
  constructor(private formBuilder : FormBuilder){
    this.registerForm = this.formBuilder.group({
      name : ['',[Validators.required,Validators.minLength(4)]],
      email : ['',[Validators.required,Validators.email]],
      password : ['',[Validators.required,Validators.minLength(5)]],
      confirmPassword : ['',[Validators.required,Validators.minLength(5)]],
    });
  }
  registerSubmit(){
    // console.log("Submitted form");
    if(this.registerForm.valid){
      console.log('Success' + JSON.stringify(this.registerForm.value))
      alert("Form submitted successfully")
    }else{
      console.log(this.registerForm.errors);
      this.printErrors();
    }
  }
  printErrors() {
    const controls = this.registerForm.controls;

    for (const controllerName in controls) {
      const control = controls[controllerName];
      if (control.invalid && control.touched) {
        const errors = control.errors;
        if (errors) {
          console.log(`${controllerName} has the following errors:`);
          for (const error in errors) {
            console.log(` ${error}: ${JSON.stringify(errors[error])}}`);
          }
        }
      }
    }

  }
}
