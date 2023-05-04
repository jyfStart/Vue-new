export default{
    install(){
        // 过滤器
        Vue.filter('myslice',function(){
            return value.slice(0,4)
        })
    }
}