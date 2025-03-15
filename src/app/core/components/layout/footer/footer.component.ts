import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,

  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
 @Input() title: string = '';
 currentDate : Date = new Date();
}
