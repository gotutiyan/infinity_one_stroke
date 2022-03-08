let back_grounds = new Array(N_STAGES)
// back_grounds[0] = function(){
//     fill(255);
//     for(let i=0; i<10; i++){
//         rad = 2*PI/10 * i + frameCount/50;
//         x = cos(rad) * frame_len_half * 0.8;
//         y = sin(rad) * frame_len_half * 0.8;
//         ellipse(x, y, 30, 30);
//     }
// }

N = 20;
seeds = new Array(N);
xs = new Array(N);
ys = new Array(N);
for(let i=0; i<N; i++){
    seeds[i] = i*100;
}
back_grounds[0] = function(){
    for(let i=0; i<N/2; i++){
        rad = map(noise(seeds[i]), 0, 1, 0, 2*PI);
        xs[i] = cos(rad) * frame_len_half * 0.8;
        ys[i] = sin(rad) * frame_len_half * 0.8;
    }
    for(let i=N/2; i<N; i++){
        rad = map(noise(seeds[i]), 0, 1, 0, 2*PI);
        xs[i] = cos(rad) * frame_len_half * 0.6;
        ys[i] = sin(rad) * frame_len_half * 0.6;
    }
    strokeWeight(5);
    stroke(255);
    for(let i=0; i<N/2; i++){
        for(let j=N/2; j<N; j++){
            if((xs[i]-xs[j])*(xs[i]-xs[j]) + (ys[i]-ys[j])*(ys[i]-ys[j]) < 500){
                line(xs[i], ys[i], xs[j], ys[j]);
            }
        }
    }
    // strokeWeight(1);
}