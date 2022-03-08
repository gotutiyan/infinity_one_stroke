function generate_tile_layout(n){
    while(true){
        let layout = expand_root(n);
        if(white_ratio(n, layout.state_temp) >= 0.6)return layout;
    }
    
}

function is_inner(x){
    return 0<=x && x<n;
}

function random_int(max) {
    // return [0, max)
    return Math.floor(Math.random() * max);
}

function expand_root(n){
    dx = [0, 0, -1, 1];
    dy = [1, -1, 0, 0];
    let state_temp = new Array(n);
    for(let i=0; i<n; i++)state_temp[i] = new Array(n).fill(config.WHITE_ID);
    let start_ix = {'x':-1, 'y':-1};
    start_ix.x = random_int(n);
    start_ix.y = random_int(n);
    state_temp[start_ix.x][start_ix.y] = config.WROTE_ID;
    // debug(state);
    let now_ix = {'x':0, 'y':0};
    now_ix.x = start_ix.x;
    now_ix.y = start_ix.y;
    let white_ix = [];
    while(true){
        let sidx = random_int(4);
        let found = false;
        for(let i=sidx; i<sidx+4; i++){
            let nx = now_ix.x + dx[i%4];
            let ny = now_ix.y + dy[i%4];
            if(is_inner(nx) && is_inner(ny) && state_temp[nx][ny] == config.WHITE_ID && n_can_move(nx, ny, state_temp) > 0){
                state_temp[nx][ny] = config.WROTE_ID;
                white_ix.push({'x':nx, 'y':ny});
                now_ix.x = nx;
                now_ix.y = ny;
                found = true;
                console.log('x, y', nx, ny);
                break;
            }
        }
        if((white_ix.length) / (n*n) >= limitation_tiles_ratio){
            break;
        }
        if(!found)break;
    }
    // debug(state);
    return {'start_ix':start_ix, 'white_ix':white_ix, 'state_temp':state_temp};
}

function n_can_move(x, y, state_temp){
    let dx = [0, 0, -1, 1];
    let dy = [1, -1, 0, 0];
    let t = 0;
    for(let i=0; i<4; i++){
        let nx = x + dx[i];
        let ny = y + dy[i];
        if(is_inner(nx) && is_inner(ny) && state_temp[nx][ny] == config.WHITE_ID){
            t++;
        }
    }
    return t;
}

function white_ratio(n, state){
    let t = 0;
    for(let i=0; i<n; i++){
        for(let j=0; j<n; j++){
            if(state[i][j] == config.WROTE_ID){
                t++;
            }
        }
    }
    return t / (n*n);
}

function debug(state){
    for(let i=0; i<state.length; i++){
        console.log(state[i]);
    }
}