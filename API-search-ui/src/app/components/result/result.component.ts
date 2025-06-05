import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-result',
  imports: [],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {
  apiResponse = signal('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at elementum quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin molestie ipsum et condimentum vehicula. Duis sit amet orci neque. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut vel odio facilisis, pharetra lorem sed, pretium mauris. Phasellus accumsan libero sit amet sodales tincidunt. Nullam aliquet neque nisl, ut consectetur ipsum auctor ut.\n' +
    '\n' +
    '    Sed sit amet posuere lorem. Phasellus faucibus euismod iaculis. Sed egestas dui non lectus pulvinar laoreet. Morbi urna ipsum, porta at ipsum in, commodo blandit nulla. Phasellus ornare pulvinar risus, a imperdiet ex convallis at. Nunc a ultrices neque. Aliquam erat volutpat. Curabitur congue nulla tellus, non elementum orci tincidunt non. Vivamus vehicula eu tortor blandit egestas. Duis finibus convallis nulla, a consequat ipsum efficitur elementum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed gravida, neque vitae interdum posuere, magna est finibus tellus, id bibendum sem dolor nec orci. Nam interdum porta rutrum.\n' +
    '\n' +
    '    Quisque placerat non felis quis convallis. In laoreet in dui ac rhoncus. Nunc maximus, diam in molestie iaculis, mauris magna vehicula lacus, vitae porta neque felis et nisi. Suspendisse ac sem ultricies enim consectetur venenatis. Nullam volutpat laoreet lorem vitae rutrum. Suspendisse ut erat est. Nulla a ornare risus. Donec a dui sed massa laoreet vulputate sollicitudin vitae purus. Mauris id tempor metus. Proin id semper lorem, id suscipit libero. Integer pulvinar, sem vitae pellentesque sodales, lacus lectus blandit sapien, quis egestas purus quam eu leo.\n' +
    '\n' +
    '    Duis non dignissim enim. Aenean semper quam eget sem tincidunt elementum. Nulla ut fermentum lorem, id tempus lorem. Etiam volutpat diam at euismod pharetra. Vivamus pretium, lectus at hendrerit imperdiet, quam ex luctus tellus, at rutrum diam dolor nec enim. Sed hendrerit nec ligula quis molestie. Integer velit tortor, sollicitudin ac nulla at, consequat viverra sapien. Vivamus ut feugiat arcu. Suspendisse volutpat dolor et condimentum tincidunt. Duis euismod, nibh quis scelerisque fermentum, felis leo tempor nibh, quis scelerisque lacus eros et leo. Aliquam ut ornare dui, vel efficitur orci. Praesent pulvinar iaculis augue non placerat. Cras vel dolor tincidunt, feugiat mi id, vehicula odio.\n' +
    '\n' +
    '    Fusce quis sapien id mauris luctus sollicitudin. Suspendisse pretium consectetur augue in tristique. Nunc eu felis nibh. Vivamus vel nulla rutrum, rutrum libero et, fringilla risus. Maecenas at commodo tellus. Nam luctus, est quis viverra convallis, enim nisi convallis felis, et maximus velit lectus sit amet erat. Nulla eleifend congue metus, id sodales nisi condimentum in. Duis vitae dignissim purus, eget tempus sem. Proin commodo sodales ligula et facilisis. Nunc faucibus efficitur magna nec imperdiet. Cras lorem libero, vehicula id congue ac, consectetur id risus. Nullam vestibulum quam mollis leo consectetur rhoncus. Maecenas imperdiet ipsum vel ipsum sodales placerat.')
}
