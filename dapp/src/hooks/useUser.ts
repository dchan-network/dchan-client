import { useCallback, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import USER_GET from "graphql/queries/user/get";
import { Admin, User } from "dchan";
import useWeb3 from "./useWeb3";

interface UserData {
  admin?: Admin;
  user?: User;
}
interface UserVars {
  address: string;
}

const useUser = () => {
  const { accounts } = useWeb3()
  const address = accounts.length > 0 ? accounts[0] : ""

  const query = useQuery<UserData, UserVars>(USER_GET, {
    variables: { address },
    skip: !address
  })

  const { refetch, loading, data } = query

  const isAdmin = useCallback(() => {
    if (loading) return undefined

    const isAdmin = !!(data?.admin?.id)

    return isAdmin
  }, [loading, data])

  const isJannyOf = useCallback((boardId: string) => {
    if (loading) return undefined

    const isJanny = isAdmin() || !!(data?.user?.jannies?.filter(({ board }) => board?.id === boardId).length)

    return isJanny
  }, [isAdmin, loading, data])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { ...query, isJannyOf, isAdmin }
}

export default useUser;
